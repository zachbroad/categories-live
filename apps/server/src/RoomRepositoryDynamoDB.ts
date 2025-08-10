import {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand,
  DynamoDB
} from '@aws-sdk/client-dynamodb';
import Room from './Room.js';
import Client from './Client.js';

class RoomRepositoryDynamoDB {
  constructor(
    private readonly ddb: DynamoDB,
    readonly TABLE_NAME: string
  ) {}

  public async createRoom(name: string, capacity: number, owner: Client): Promise<Room> {
    const room = new Room(name, capacity);
    room.owner = owner;

    await this.ddb.send(
      new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          id: { S: room.id },
          name: { S: room.name },
          capacity: { N: room.capacity.toString() },
          owner: { S: JSON.stringify(room.owner) }
        }
      })
    );

    return room;
  }

  public async getRoom(id: UUID): Promise<Room | undefined> {
    const result = await this.ddb.send(
      new GetItemCommand({
        TableName: this.TABLE_NAME,
        Key: { id: { S: id } }
      })
    );

    if (!result.Item) return undefined;

    const room = new Room(result.Item.name.S as string, parseInt(result.Item.capacity.N as string));
    room.id = result.Item.id.S as string;
    room.owner = JSON.parse(result.Item.owner.S as string) as Client;
    return room;
  }

  public async updateRoom(room: Room): Promise<Room> {
    await this.ddb.send(
      new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          id: { S: room.id },
          name: { S: room.name },
          capacity: { N: room.capacity.toString() },
          owner: { S: JSON.stringify(room.owner) }
        }
      })
    );
    return room;
  }

  public async deleteRoom(id: UUID): Promise<boolean> {
    try {
      await this.ddb.send(
        new DeleteItemCommand({
          TableName: this.TABLE_NAME,
          Key: { id: { S: id } }
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getAllRooms(): Promise<Room[]> {
    const result = await this.ddb.send(
      new ScanCommand({
        TableName: this.TABLE_NAME
      })
    );

    return (result.Items || []).map(item => {
      const room = new Room(item.name.S as string, parseInt(item.capacity.N as string));
      room.id = item.id.S as string;
      room.owner = JSON.parse(item.owner.S as string) as Client;
      return room;
    });
  }
}

export default RoomRepositoryDynamoDB;
