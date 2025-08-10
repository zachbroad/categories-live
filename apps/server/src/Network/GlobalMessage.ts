import DIContainer from '../DIContainer';
import { AbstractSocketHandler } from './AbstractSocketHandler';

interface GlobalMessageData {
  message: string;
}

export default class GlobalMessage extends AbstractSocketHandler {
  public static event = 'global:message';

  handle(data: GlobalMessageData): void {
    const msg = data?.message;

    if (msg?.trim() === '' || !msg) {
      this.sender.error(`Message can't be blank.`);
      return;
    }

    console.log(`${this.sender} sent message: ${msg}`);
    const formattedMsg = `${this.sender.username}: ${msg}`;
    DIContainer.socketIO.to('global').emit('global:message', formattedMsg);
  }
}
