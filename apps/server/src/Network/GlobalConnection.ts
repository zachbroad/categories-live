import { MOTD } from '../Config';
import { AbstractSocketHandler } from './AbstractSocketHandler';

class GlobalConnection extends AbstractSocketHandler {
  public static event = 'connection';

  handle(): void {}
}

export default GlobalConnection;
