import Client from './Client.js';

interface IClientRepository {
  createClient(client: Client): Promise<Client>;
  getClient(id: UUID): Promise<Client | undefined>;
  updateClient(client: Client): Promise<Client>;
  deleteClient(id: UUID): Promise<boolean>;
}

export default IClientRepository;
