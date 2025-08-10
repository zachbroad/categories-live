import Client from './Client.js';
import IClientRepository from './IClientRepository.js';

class ClientService {
  public constructor(private readonly clientRepository: IClientRepository) {}

  public async createClient(client: Client): Promise<Client> {
    return this.clientRepository.createClient(client);
  }

  public async getClient(id: UUID): Promise<Client | undefined> {
    return this.clientRepository.getClient(id);
  }

  public async updateClient(client: Client): Promise<Client> {
    return this.clientRepository.updateClient(client);
  }

  public async deleteClient(id: UUID): Promise<boolean> {
    return this.clientRepository.deleteClient(id);
  }
}

export default ClientService;
