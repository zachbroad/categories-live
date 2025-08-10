import Room from './Room';
import Client from './Client';

interface IRoomRepository {
  createRoom(name: string, capacity: number, owner: Client): Promise<Room>;
  getRoom(slug: string): Promise<Room | undefined>;
  updateRoom(room: Room): Promise<Room>;
  deleteRoom(slug: string): Promise<boolean>;
  getAllRooms(): Promise<Room[]>;
}

export default IRoomRepository;
