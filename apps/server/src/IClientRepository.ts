import Client from './Client';

interface IClientRepository {
  createClient(client: Client): Promise<Client>;
  getClient(id: string): Promise<Client | undefined>;
  updateClient(client: Client): Promise<Client>;
  deleteClient(id: string): Promise<boolean>;
}

export default IClientRepository;
