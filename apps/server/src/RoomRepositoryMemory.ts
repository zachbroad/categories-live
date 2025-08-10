import Room from './Room';
import Client from './Client';
import IRoomRepository from './IRoomRepository';
import { Server } from 'socket.io';

class RoomRepositoryMemory implements IRoomRepository {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  public async createRoom(name: string, capacity: number, owner: Client, io?: Server): Promise<Room> {
    const room = new Room(name, capacity, owner, true, io);
    this.rooms.set(room.slug, room);
    return room;
  }

  public async getRoom(slug: string): Promise<Room | undefined> {
    return this.rooms.get(slug);
  }

  public async updateRoom(room: Room): Promise<Room> {
    this.rooms.set(room.slug, room);
    return room;
  }

  public async deleteRoom(slug: string): Promise<boolean> {
    return this.rooms.delete(slug);
  }

  public async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }
}

export default RoomRepositoryMemory;
