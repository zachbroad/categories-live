import { Pool } from 'pg';
import IClientRepository from './IClientRepository';
import Client from './Client';

interface ClientRepositoryPostgresDependencies {
  pool: Pool;
}

class ClientRepositoryPostgres implements IClientRepository {
  private pool: Pool;

  constructor({ pool }: ClientRepositoryPostgresDependencies) {
    this.pool = pool;
  }

  public async createClient(client: Client): Promise<Client> {
    const query = `
      INSERT INTO clients (id, username, socket_id, room_id, ip_address, connected_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        socket_id = EXCLUDED.socket_id,
        room_id = EXCLUDED.room_id,
        connected_at = NOW(),
        disconnected_at = NULL
      RETURNING *
    `;

    const values = [
      client.id,
      client.username,
      client.socket.id,
      client.roomSlug ? await this.getRoomIdBySlug(client.roomSlug) : null,
      client.address
    ];

    try {
      const result = await this.pool.query(query, values);
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  public async getClient(id: string): Promise<Client | undefined> {
    const query = `
      SELECT c.*, r.slug as room_slug 
      FROM clients c
      LEFT JOIN rooms r ON c.room_id = r.id
      WHERE c.id = $1 AND c.disconnected_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return undefined;
      }

      // Note: We can't fully reconstruct a Client with socket from DB
      // This is mainly for tracking/persistence, active clients are in memory
      return result.rows[0];
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  }

  public async updateClient(client: Client): Promise<Client> {
    const query = `
      UPDATE clients 
      SET username = $2, 
          socket_id = $3,
          room_id = $4
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      client.id,
      client.username,
      client.socket.id,
      client.roomSlug ? await this.getRoomIdBySlug(client.roomSlug) : null
    ];

    try {
      await this.pool.query(query, values);
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  public async deleteClient(id: string): Promise<boolean> {
    const query = `
      UPDATE clients 
      SET disconnected_at = NOW()
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  public async getClients(): Promise<Client[]> {
    const query = `
      SELECT c.*, r.slug as room_slug 
      FROM clients c
      LEFT JOIN rooms r ON c.room_id = r.id
      WHERE c.disconnected_at IS NULL
      ORDER BY c.connected_at DESC
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  }

  // Helper method to get room ID from slug
  private async getRoomIdBySlug(slug: string): Promise<string | null> {
    const query = 'SELECT id FROM rooms WHERE slug = $1';
    try {
      const result = await this.pool.query(query, [slug]);
      return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
      console.error('Error getting room ID:', error);
      return null;
    }
  }
}

export default ClientRepositoryPostgres;
