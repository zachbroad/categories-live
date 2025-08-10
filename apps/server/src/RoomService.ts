import Room from './Room';
import Client from './Client';
import IRoomRepository from './IRoomRepository';
import { Server } from 'socket.io';

interface RoomServiceDependencies {
  roomRepository: IRoomRepository;
  io: Server;
}

class RoomService {
  private readonly roomRepository: IRoomRepository;
  private readonly io: Server;

  public constructor({ roomRepository, io }: RoomServiceDependencies) {
    this.roomRepository = roomRepository;
    this.io = io;
  }

  public async createRoom(slug: string, capacity: number, owner: Client): Promise<Room> {
    const room = await this.roomRepository.createRoom(slug, capacity, owner, this.io);
    room.setIO(this.io);
    return room;
  }

  public async getRoom(slug: string): Promise<Room | undefined> {
    const room = await this.roomRepository.getRoom(slug);
    if (room) {
      room.setIO(this.io);
    }
    return room;
  }

  public async updateRoom(room: Room): Promise<Room> {
    return this.roomRepository.updateRoom(room);
  }

  public async deleteRoom(slug: string): Promise<boolean> {
    return this.roomRepository.deleteRoom(slug);
  }

  public async getAllRooms(): Promise<Room[]> {
    const rooms = await this.roomRepository.getAllRooms();
    rooms.forEach(room => room.setIO(this.io));
    return rooms;
  }
}

export default RoomService;
