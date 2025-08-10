import IClientRepository from './IClientRepository.js';
import Client from './Client.js';

class ClientRepositoryMemory implements IClientRepository {
  private clients: Map<string, Client> = new Map();

  public async createClient(client: Client): Promise<Client> {
    this.clients.set(client.id, client);
    return client;
  }

  public async getClient(id: UUID): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  public async updateClient(client: Client): Promise<Client> {
    this.clients.set(client.id, client);
    return client;
  }

  public async deleteClient(id: UUID): Promise<boolean> {
    return this.clients.delete(id);
  }

  public async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
}

export default ClientRepositoryMemory;
