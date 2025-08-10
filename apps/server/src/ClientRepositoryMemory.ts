import IClientRepository from './IClientRepository';
import Client from './Client';

class ClientRepositoryMemory implements IClientRepository {
  private clients: Map<string, Client> = new Map();

  public async createClient(client: Client): Promise<Client> {
    this.clients.set(client.id, client);
    return client;
  }

  public async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  public async updateClient(client: Client): Promise<Client> {
    this.clients.set(client.id, client);
    return client;
  }

  public async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  public async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
}

export default ClientRepositoryMemory;
