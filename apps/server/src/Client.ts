import Room from '@categories/server/Room';
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import RoomService from './RoomService';

class Client {
  public id: string; // UUID for database
  public username: string;
  public socket: Socket;
  public address: string;
  public roomSlug: string | null; // TODO: Improve this
  private roomService?: RoomService;
  private io?: Server;

  constructor(socket: Socket, name: string = 'No Name', address: string) {
    this.socket = socket;
    this.id = uuidv4(); // Generate UUID for database
    this.username = name;
    this.address = address;
    this.roomSlug = null;
  }

  public setDependencies(roomService: RoomService, io: Server): void {
    this.roomService = roomService;
    this.io = io;
  }

  public async getRoom(): Promise<Room | undefined> {
    if (this.roomSlug && this.roomService) {
      return this.roomService.getRoom(this.roomSlug);
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
        if (this.roomService) {
          await this.roomService.deleteRoom(room.id);
        }
      }

      this.roomSlug = null;
    } else {
      console.log(`${this.username} was not in any room.`);
    }
  }

  public async sendListOfRooms(): Promise<void> {
    if (this.roomService && this.io) {
      const rooms = await this.roomService.getAllRooms();
      this.io.to(this.socket.id).emit('roomList', rooms);
    }
  }

  public async getCurrentRoom(): Promise<Room | undefined> {
    if (!this.roomSlug) {
      return undefined;
    }

    if (this.roomService) {
      return await this.roomService.getRoom(this.roomSlug);
    }
    return undefined;
  }

  public async setUsername(name: string): Promise<void> {
    console.log(`${this.username} is changing their name to ${name}`);
    this.username = name;
    const room = await this.getCurrentRoom();

    if (room && this.roomService) {
      this.roomService
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
  //     this.io.to(this.socket.id).emit("global:messageHistory", this.messages);
  // }
}

export default Client;
