import { Server, Socket } from 'socket.io';
import Client from '../Client';

export abstract class AbstractSocketHandler {
  public static event: string;
  protected io: Server;
  protected socket: Socket;
  protected sender: Client;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.sender = socket.data.user; // todo:
  }

  abstract handle(...args: any[]): void;
}
