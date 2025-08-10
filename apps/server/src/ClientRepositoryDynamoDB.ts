import IClientRepository from './IClientRepository';
import Client from './Client';
import {
  DynamoDB,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';

class ClientRepositoryDynamoDB implements IClientRepository {
  constructor(
    private readonly ddb: DynamoDB,
    readonly TABLE_NAME: string
  ) {}

  public async createClient(client: Client): Promise<Client> {
    await this.ddb.send(
      new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          id: { S: client.id },
          username: { S: client.username }
        }
      })
    );

    return client;
  }

  public async getClient(id: UUID): Promise<Client | undefined> {
    const result = await this.ddb.send(
      new GetItemCommand({
        TableName: this.TABLE_NAME,
        Key: { id: { S: id } }
      })
    );

    if (!result.Item) {
      return undefined;
    }

    return this.mapToClient(result.Item);
  }

  public async updateClient(client: Client): Promise<Client> {
    await this.ddb.send(
      new PutItemCommand({
        TableName: this.TABLE_NAME,
        Item: {
          id: { S: client.id },
          username: { S: client.username }
        }
      })
    );

    return client;
  }

  public async deleteClient(id: UUID): Promise<boolean> {
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

  private mapToClient(item: Record<string, any>): Client {
    const client = new Client(item.username.S, item.id.S, item.address.S);
    client.id = item.id.S;
    return client;
  }
}

export default ClientRepositoryDynamoDB;
