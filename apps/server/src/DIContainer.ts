import { DynamoDB } from '@aws-sdk/client-dynamodb';
import ClientService from './ClientService.js';
import RoomService from './RoomService.js';
import { Server } from 'socket.io';
import ClientRepositoryMemory from './ClientRepositoryMemory.js';
import RoomRepositoryMemory from './RoomRepositoryMemory.js';

export class Container {
  private static instance: Container;

  private readonly _clientService: ClientService;
  private readonly _roomService: RoomService;
  private _socketIO: Server | undefined;

  private constructor(ddb: DynamoDB) {
    const clientRepository = new ClientRepositoryMemory();
    const roomRepository = new RoomRepositoryMemory();

    this._clientService = new ClientService(clientRepository);
    this._roomService = new RoomService(roomRepository);
  }

  public static initialize(ddb: DynamoDB): void {
    if (Container.instance) {
      throw new Error('Container is already initialized');
    }
    Container.instance = new Container(ddb);
  }

  public static get clientService(): ClientService {
    if (!Container.instance) {
      throw new Error('Container must be initialized before use');
    }
    return Container.instance._clientService;
  }

  public static get roomService(): RoomService {
    if (!Container.instance) {
      throw new Error('Container must be initialized before use');
    }
    return Container.instance._roomService;
  }

  public static get socketIO(): Server {
    if (!Container.instance) {
      throw new Error('Container must be initialized before use');
    }
    return Container.instance._socketIO as Server;
  }

  public static setSocketIO(socketIO: Server): void {
    if (!Container.instance) {
      throw new Error('Container must be initialized before use');
    }
    Container.instance._socketIO = socketIO;
  }
}

export default Container;
