import Client from './Client';
import IClientRepository from './IClientRepository';

interface ClientServiceDependencies {
  clientRepository: IClientRepository;
}

class ClientService {
  private readonly clientRepository: IClientRepository;

  public constructor({ clientRepository }: ClientServiceDependencies) {
    this.clientRepository = clientRepository;
  }

  public async createClient(client: Client): Promise<Client> {
    return this.clientRepository.createClient(client);
  }

  public async getClient(id: string): Promise<Client | undefined> {
    return this.clientRepository.getClient(id);
  }

  public async updateClient(client: Client): Promise<Client> {
    return this.clientRepository.updateClient(client);
  }

  public async deleteClient(id: string): Promise<boolean> {
    return this.clientRepository.deleteClient(id);
  }
}

export default ClientService;
