import { Pool } from 'pg';
import { Server } from 'socket.io';
import ChatMessage from './ChatMessage';
import Client from './Client';
import Game from './Game';
import IRoomRepository from './IRoomRepository';
import Room from './Room';
import RoomStatus from './RoomStatus';

interface RoomRepositoryPostgresDependencies {
  pool: Pool;
}

class RoomRepositoryPostgres implements IRoomRepository {
  private pool: Pool;

  constructor({ pool }: RoomRepositoryPostgresDependencies) {
    this.pool = pool;
  }

  public async createRoom(name: string, capacity: number, owner: Client, io?: Server): Promise<Room> {
    // Create a new Room instance
    const room = new Room(name, capacity, owner, true, io);
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert room
      const roomQuery = `
        INSERT INTO rooms (id, slug, name, capacity, status, owner_id, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const roomValues = [
        room.id,
        room.slug,
        room.name,
        room.capacity,
        room.status,
        room.owner?.id || null,
        room.isPublic
      ];

      await client.query(roomQuery, roomValues);

      // If there's a game, save it too
      if (room.game) {
        await this.saveGame(client, room.id, room.game);
      }

      await client.query('COMMIT');
      return room;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating room:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async getRoom(slug: string): Promise<Room | undefined> {
    const client = await this.pool.connect();

    try {
      // Get room data
      const roomQuery = `
        SELECT r.*, 
               c.id as owner_id, c.username as owner_username, c.socket_id as owner_socket_id
        FROM rooms r
        LEFT JOIN clients c ON r.owner_id = c.id
        WHERE r.slug = $1
      `;

      const roomResult = await client.query(roomQuery, [slug]);

      if (roomResult.rows.length === 0) {
        return undefined;
      }

      const roomData = roomResult.rows[0];

      // Get clients in room
      const clientsQuery = `
        SELECT * FROM clients 
        WHERE room_id = $1 AND disconnected_at IS NULL
      `;
      const clientsResult = await client.query(clientsQuery, [roomData.id]);

      // Get chat messages
      const chatQuery = `
        SELECT * FROM chat_messages 
        WHERE room_id = $1 
        ORDER BY created_at ASC
        LIMIT 100
      `;
      const chatResult = await client.query(chatQuery, [roomData.id]);

      // Get current game if exists
      const gameQuery = `
        SELECT * FROM games 
        WHERE room_id = $1 AND completed_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const gameResult = await client.query(gameQuery, [roomData.id]);

      // Reconstruct Room object
      // Note: This is a simplified version, actual Socket connections are in memory
      const room = new Room(roomData.name, roomData.capacity, null, roomData.is_public, null);
      room.id = roomData.id;
      room.slug = roomData.slug;
      room.status = roomData.status as RoomStatus;
      room.chat = chatResult.rows.map(row => ({
        username: row.username,
        message: row.message,
        timestamp: row.created_at
      }));

      // Load game data if exists
      if (gameResult.rows.length > 0) {
        const gameData = gameResult.rows[0];
        room.game = new Game(gameData.letter);
        room.game.currentRound = gameData.current_round;
        room.game.rounds = gameData.total_rounds;
        // Load prompts and answers
        await this.loadGameDetails(client, gameData.id, room.game);
      }

      return room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async updateRoom(room: Room): Promise<Room> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update room
      const roomQuery = `
        UPDATE rooms 
        SET name = $2, capacity = $3, status = $4, owner_id = $5, is_public = $6
        WHERE slug = $1
        RETURNING *
      `;

      const roomValues = [
        room.slug,
        room.name,
        room.capacity,
        room.status,
        room.owner?.id || null,
        room.isPublic
      ];

      await client.query(roomQuery, roomValues);

      // Save game state if exists
      if (room.game) {
        await this.saveGame(client, room.id, room.game);
      }

      // Save recent chat messages
      if (room.chat.length > 0) {
        await this.saveChatMessages(client, room.id, room.chat);
      }

      await client.query('COMMIT');
      return room;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating room:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async deleteRoom(slug: string): Promise<boolean> {
    const query = 'DELETE FROM rooms WHERE slug = $1';

    try {
      const result = await this.pool.query(query, [slug]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  public async getAllRooms(): Promise<Room[]> {
    const query = `
      SELECT r.*, COUNT(c.id) as client_count
      FROM rooms r
      LEFT JOIN clients c ON r.id = c.room_id AND c.disconnected_at IS NULL
      WHERE r.is_public = true
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;

    try {
      const result = await this.pool.query(query);

      // Convert to Room objects (simplified version)
      return result.rows.map(row => {
        const room = new Room(row.name, row.capacity, null, row.is_public, null);
        room.id = row.id;
        room.slug = row.slug;
        room.status = row.status as RoomStatus;
        return room;
      });
    } catch (error) {
      console.error('Error getting all rooms:', error);
      throw error;
    }
  }

  // Helper methods
  private async saveGame(client: any, roomId: string, game: Game): Promise<void> {
    // Save game (new game for each room session)
    const gameQuery = `
      INSERT INTO games (room_id, current_round, total_rounds, letter, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const gameValues = [
      roomId,
      game.currentRound,
      game.rounds,
      game.letter,
      game.hasBeenScored ? 'completed' : 'in_progress'
    ];

    const gameResult = await client.query(gameQuery, gameValues);
    const gameId = gameResult.rows[0].id;

    // Save prompts
    if (game.currentPrompts.length > 0) {
      for (let i = 0; i < game.currentPrompts.length; i++) {
        const promptQuery = `
          INSERT INTO game_prompts (game_id, round_number, prompt_text, prompt_order)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(promptQuery, [gameId, game.currentRound, game.currentPrompts[i], i]);
      }
    }

    // Save answers/results if any
    if (Object.keys(game.results).length > 0) {
      for (const clientId in game.results) {
        const answerQuery = `
          INSERT INTO game_answers (game_id, client_id, round_number, answers, scores, total_score)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (game_id, client_id, round_number)
          DO UPDATE SET 
            answers = EXCLUDED.answers,
            scores = EXCLUDED.scores,
            total_score = EXCLUDED.total_score
        `;

        const answers = game.results[clientId].answers || [];
        const scores = game.results[clientId].results || [];
        const totalScore = scores.reduce((sum: number, score: number) => sum + score, 0);

        await client.query(answerQuery, [
          gameId,
          clientId,
          game.currentRound,
          JSON.stringify(answers),
          JSON.stringify(scores),
          totalScore
        ]);
      }
    }
  }

  private async loadGameDetails(client: any, gameId: string, game: Game): Promise<void> {
    // Load prompts
    const promptsQuery = `
      SELECT * FROM game_prompts 
      WHERE game_id = $1 AND round_number = $2
      ORDER BY prompt_order
    `;
    const promptsResult = await client.query(promptsQuery, [gameId, game.currentRound]);
    game.currentPrompts = promptsResult.rows.map((row: any) => row.prompt_text);

    // Load answers
    const answersQuery = `
      SELECT * FROM game_answers 
      WHERE game_id = $1 AND round_number = $2
    `;
    const answersResult = await client.query(answersQuery, [gameId, game.currentRound]);

    game.results = {};
    answersResult.rows.forEach((row: any) => {
      game.results[row.client_id] = {
        answers: row.answers,
        results: row.scores
      };
    });
  }

  private async saveChatMessages(
    client: any,
    roomId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    // Only save new messages (last 10 for performance)
    const recentMessages = messages.slice(-10);

    for (const msg of recentMessages) {
      const query = `
        INSERT INTO chat_messages (room_id, username, message, created_at)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(query, [roomId, msg.username, msg.message, msg.timestamp]);
    }
  }
}

export default RoomRepositoryPostgres;
