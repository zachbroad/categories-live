import Client from '../Client';
import { AbstractSocketHandler } from './AbstractSocketHandler';

class GlobalDisconnect extends AbstractSocketHandler {
  public static event = 'disconnect';

  handle(): void {
    console.log(`Handling ${this}'s disconnection`);
    // get client
    const client: Client = this.sender;

    // get their current room
    client.getRoom().then(room => {
      if (room) {
        // Remove from room if they're in a room
        console.log(`${this} is in room ${room}, removing...`);
        room.removeClient(client);

        // Is the room now empty? If so, let's delete it.
        if (room.isEmpty()) {
          console.log(`Room ${room.slug} is empty... destroying!`);
          room.destroy();
        }
      } else {
        console.log(`${this} is not in any rooms...`);
      }
    });
  }
}

export default GlobalDisconnect;
