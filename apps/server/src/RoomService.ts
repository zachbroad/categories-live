import Room from './Room';
import Client from './Client';
import IRoomRepository from './IRoomRepository';

class RoomService {
  public constructor(private readonly roomRepository: IRoomRepository) {}

  public async createRoom(slug: string, capacity: number, owner: Client): Promise<Room> {
    return this.roomRepository.createRoom(slug, capacity, owner);
  }

  public async getRoom(slug: string): Promise<Room | undefined> {
    return this.roomRepository.getRoom(slug);
  }

  public async updateRoom(room: Room): Promise<Room> {
    return this.roomRepository.updateRoom(room);
  }

  public async deleteRoom(slug: string): Promise<boolean> {
    return this.roomRepository.deleteRoom(slug);
  }

  public async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.getAllRooms(); // TODO: handle private/public rooms
  }
}

export default RoomService;
