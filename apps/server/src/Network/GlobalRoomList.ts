import DIContainer from '../DIContainer.js';
import { AbstractSocketHandler } from './AbstractSocketHandler.js';

class GlobalRoomList extends AbstractSocketHandler {
  public static event = 'globalRoomList';

  async handle(data: any): Promise<void> {
    const roomService = DIContainer.roomService;
    const rooms = await roomService.getAllRooms();

    this.socket.emit('globalRoomList', rooms);
  }
}

export default GlobalRoomList;
