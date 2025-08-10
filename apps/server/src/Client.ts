import { Socket } from 'socket.io';
import Room from './Room.js';
import DIContainer from './DIContainer.js';

class Client {
  public id: string;
  public username: string;
  public socket: Socket;
  public address: string;
  public roomSlug: string | null; // TODO: Improve this

  constructor(socket: Socket, name: string = 'No Name', address: string) {
    this.socket = socket;
    this.id = socket.id;
    this.username = name;
    this.address = address;
    this.roomSlug = null;
  }

  public async getRoom(): Promise<Room | undefined> {
    if (this.roomSlug) {
      return DIContainer.roomService.getRoom(this.roomSlug);
    }

    return undefined;
  }

  public toJSON(): object {
    return {
      id: this.id,
      username: this.username,
      address: this.address,
      roomSlug: this.roomSlug
    };
  }

  public toString(): string {
    return `${this.username}@(${this.address})`;
  }

  public send(msg: string, data: object = {}): void {
    this.socket.emit(msg, data);
  }

  public message(msg: string): void {
    console.log(`[${this.toString()}]: ${msg}`);
    this.socket.emit('message', msg);
  }

  public error(message: string): void {
    this.socket.emit('serverMessage', `[ERROR] ${message}`);
  }

  public leaveRoom(room: Room): void {
    if (room.clients.includes(this)) {
      room.removeClient(this);
      this.roomSlug = null;
    } else {
      this.error(`You are not in room ${room.slug}`);
    }
  }

  public async handleDisconnect(): Promise<void> {
    console.log(`${this.username} disconnected.`);
    let room = await this.getRoom();

    if (room) {
      console.log(`${this.username} was in room ${room.slug}, leaving...`);
      this.leaveRoom(room);

      if (room.isEmpty()) {
        console.log(`${room.slug} is empty, deleting...`);
        await DIContainer.roomService.deleteRoom(room.id);
      }

      this.roomSlug = null;
    } else {
      console.log(`${this.username} was not in any room.`);
    }
  }

  public async sendListOfRooms(): Promise<void> {
    const rooms = await DIContainer.roomService.getAllRooms();
    DIContainer.socketIO.to(this.socket.id).emit('global:roomList', rooms);
  }

  public async getCurrentRoom(): Promise<Room | undefined> {
    if (!this.roomSlug) {
      return undefined;
    }

    return await DIContainer.roomService.getRoom(this.roomSlug);
  }

  public async setUsername(name: string): Promise<void> {
    console.log(`${this.username} is changing their name to ${name}`);
    this.username = name;
    const room = await this.getCurrentRoom();

    if (room) {
      DIContainer.roomService
        .updateRoom(room)
        .then(room => {
          console.log(`${room.slug} updated`);
        })
        .catch(error => {
          console.error(error);
          this.error('Failed to change name');
        });
    }
  }

  // TODO: Implement message history
  // public sendMessageHistory(): void {
  //     DIContainer.socketIO.to(this.socket.id).emit("global:messageHistory", this.messages);
  // }
}

export default Client;
