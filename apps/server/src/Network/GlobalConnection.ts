import { MOTD } from '../Config.js';
import { AbstractSocketHandler } from './AbstractSocketHandler.js';

class GlobalConnection extends AbstractSocketHandler {
  public static event = 'connection';

  handle(): void {}
}

export default GlobalConnection;
