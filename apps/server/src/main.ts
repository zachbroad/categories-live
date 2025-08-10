import 'dotenv/config';
import fastify from 'fastify';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/postgres-adapter';
import Logger from './Logger';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from './SocketIO';
import { pool, testConnection } from './Database';
import { MOTD, SERVER_HOST, SERVER_PORT } from './Config';
import cors from '@fastify/cors';
import Client from './Client';
import Room from './Room';
import assert from 'assert';
import ChatMessage from './ChatMessage';
import { initializeContainer, getContainer } from './container';

// Test database connection
await testConnection();

const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) {
  console.log('[DEBUG] Debug mode enabled');
  console.log('[DEBUG] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    SERVER_HOST,
    SERVER_PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
}

const app = fastify();
await app.register(cors, {
  origin: '*' // TODO: change this for production
});

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  app.server,
  {
    cors: {
      origin: '*' // TODO: change this for production
    }
  }
);

// Use PostgreSQL adapter for horizontal scaling
io.adapter(createAdapter(pool));

process.on('SIGTERM', () => {
  io.close();
  pool.end();
});

process.on('SIGINT', async () => {
  await io.close();
  await pool.end();
  process.exit(0);
});

// Initialize dependency injection container
const container = initializeContainer(io, pool);

// Get services from container
const clientService = container.resolve('clientService');
const roomService = container.resolve('roomService');

io.on('connection', (socket: Socket) => {
  console.log('Connection: ', socket.id);
  if (DEBUG) {
    console.log('[DEBUG] Connection details:', {
      socketId: socket.id,
      address: socket.handshake.address,
      headers: socket.handshake.headers,
      query: socket.handshake.query,
      transport: socket.conn.transport.name,
      time: new Date().toISOString()
    });
  }
  socket.emit('message', MOTD);

  const name = socket.handshake.query.name as string; // TODO: define this query as a type
  const client = new Client(socket, name, socket.handshake.address);
  client.setDependencies(roomService, io);
  clientService.createClient(client);

  client.message('Welcome to the server!');
  // client.sendMessageHistory();
  // client.sendListOfRooms();

  socket.on('disconnect', (reason) => {
    if (DEBUG) {
      console.log('[DEBUG] Client disconnected:', {
        clientId: client.id,
        username: client.username,
        reason,
        roomSlug: client.roomSlug,
        time: new Date().toISOString()
      });
    }
    clientService.deleteClient(client.id);
  });

  socket.on('global:message', (message: string) => {
    client.message(message);
  });

  socket.on('global:roomList', async () => {
    if (DEBUG) {
      const rooms = await roomService.getAllRooms();
      console.log('[DEBUG] global:roomList requested:', {
        clientId: client.id,
        roomCount: rooms.length,
        rooms: rooms.map(r => ({ slug: r.slug, clients: r.clients.length }))
      });
    }
    client.sendListOfRooms();
  });

  socket.on('global:changeName', (name: string) => {
    console.log(`${client.username} is changing their name to ${name}`);
    client.username = name;
    client
      .getRoom()
      .then(room => {
        if (room) {
          clientService.updateClient(client);
          roomService.updateRoom(room);
        }
      })
      .catch(error => {
        console.error(error);
        client.error('Failed to change name');
      });
  });

  socket.on('room:create', async (slug: string) => {
    console.log(`${client.username} is creating a room with the slug ${slug}`);
    if (DEBUG) {
      console.log('[DEBUG] room:create event:', {
        clientId: client.id,
        username: client.username,
        slug,
        time: new Date().toISOString()
      });
    }

    if (!slug) {
      client.error('Slug is required');
      return;
    }

    if (slug.length < 2) {
      client.error('Slug must be at least 2 characters long');
      return;
    }

    if (await roomService.getRoom(slug)) {
      client.error('Room with this slug already exists');
      return;
    }

    const room = await roomService.createRoom(slug, 10, client);
    let [success, error] = room.addClient(client);
    if (!success) {
      client.error(error || 'Unknown error while adding client to room');
      return;
    }

    client.message(`You created the room ${room.name}`);
    client.send('room:data', room);
  });

  socket.on('room:data', (room: Room) => {
    console.log(`${client.username} is getting data for the room with the slug ${room.slug}`);
    try {
      room.updateRoom();
    } catch (error) {
      console.error(error);
      client.error('Failed to get room data');
    }
  });

  socket.on('room:join', async (slug: string) => {
    let room = await roomService.getRoom(slug);
    console.log(`${client} wants to join ${room}`);
    if (DEBUG) {
      console.log('[DEBUG] room:join event:', {
        clientId: client.id,
        username: client.username,
        slug,
        roomExists: !!room,
        roomClients: room?.clients.length || 0,
        time: new Date().toISOString()
      });
    }

    if (!room) {
      client.error('You tried to join a room that does not exist!');
      return;
    }

    let [joined, message] = room.addClient(client);

    // if joined, send join message to all clients in room
    if (joined) {
      // join the room by slug
      socket.join(room.slug);

      // send success
      console.log(`${client} joined ${room}.`);
      client.send('room:data', room);
      client.message(`You joined ${room.name}.`);
    } else {
      // Failed to join room, send error msg
      console.log(`${client} failed to join ${room} - ${message}.`);
      client.error(message || 'Unknown error while joining room');
    }
  });

  socket.on('room:chatMessage', async (message: string) => {
    if (DEBUG) {
      console.log('[DEBUG] room:chatMessage event:', {
        clientId: client.id,
        username: client.username,
        roomSlug: client.roomSlug,
        messageLength: message.length,
        time: new Date().toISOString()
      });
    }
    if (!client.roomSlug) {
      client.error('You must be in a room to send chat messages!');
      return;
    }

    const room = await roomService.getRoom(client.roomSlug);
    if (!room) {
      client.error(`Room ${client.roomSlug} not found!`);
      return;
    }

    let chatMessage: ChatMessage = {
      username: client.username,
      message: message,
      timestamp: new Date()
    };

    room.chat = room.chat.concat(chatMessage);
    io.sockets.in(room.slug).emit('room:chatMessage', chatMessage);
  });

  socket.on('room:startGame', async (data: { slug: string }) => {
    assert(data, 'Data is required');
    assert(data.slug, 'Slug is required');

    const { slug } = data;

    console.log(`${client.username} requested to start a game`);
    if (DEBUG) {
      const room = await roomService.getRoom(slug);
      console.log('[DEBUG] room:startGame event:', {
        clientId: client.id,
        username: client.username,
        slug,
        roomClients: room?.clients.length || 0,
        gameState: room?.state || 'unknown',
        time: new Date().toISOString()
      });
    }
    if (!slug) {
      client.error('You must be in a room to start a game!');
      return;
    }

    // Get the room by slug
    const room = await roomService.getRoom(slug);
    if (!room) {
      console.error(`Tried to start game for room ${slug} but couldn't find room!`);
      client.error('Room not found!');
      return;
    }

    // Make sure client is in room
    if (!room.hasClient(client)) {
      client.error('You must be in a room to start a game!');
      return;
    }

    console.log(`${client.username} requested to start ${slug}`);
    room.startGame();
  });

  socket.on('room:provideAnswers', async (data: { slug: string; answers: string[] }) => {
    assert(data, 'Data is required');
    assert(data.slug, 'Slug is required');
    assert(data.answers, 'Answers are required');
    assert(data.answers.length > 0, 'Answers must contain at least one answer');

    const { slug, answers } = data;
    if (DEBUG) {
      console.log('[DEBUG] room:provideAnswers event:', {
        clientId: client.id,
        username: client.username,
        slug,
        answerCount: answers.length,
        time: new Date().toISOString()
      });
    }
    const room = await roomService.getRoom(slug);

    // Make sure room exists
    if (!room) {
      console.error(`${client} tried to provide answers for room ${slug} but it doesn't exist!`);
      return;
    }

    // Make sure client is in room
    if (!room.hasClient(client)) {
      console.error(
        `${client} tried to provide answers for room ${slug} but they're not in the room!`
      );
      return;
    }

    // TODO: Fix this
    // // Make sure client hasn't already provided answers
    // if (client.id in room.game.results) {
    //   console.error(`${client} tried to provide answers for room ${slug} but they've already provided answers!`);
    //   return;
    // }

    // Store answers
    room.game!.results[client.id] = {};
    room.game!.results[client.id].answers = answers;
    room.game!.results[client.id].results = [];

    // Check if everyone has provided answers
    if (room.hasEveryoneSubmittedAnswers()) {
      // Everyone is done, score the game
      console.log('Everyone is done, scoring game...');

      await room.handleScoring();
    } else {
      // Not everyone is done, update room
      room.updateRoom();
    }
  });

  socket.on('room:leave', async (data: { slug: string }) => {
    assert(data, 'Data is required');
    assert(data.slug, 'Slug is required');

    const { slug } = data;
    const room = await roomService.getRoom(slug);
    if (DEBUG) {
      console.log('[DEBUG] room:leave event:', {
        clientId: client.id,
        username: client.username,
        slug,
        roomExists: !!room,
        time: new Date().toISOString()
      });
    }

    // Make sure room exists
    if (!room) {
      console.error(`${client} tried to leave room ${slug} but it doesn't exist!`);
      return;
    }

    console.log(`${client} wants to leave room ${room.slug}`);

    client.leaveRoom(room); // Remove from room
    client.socket.leave(room.slug); // Leave socket chan

    room.updateRoom(); // Send updated room data to clients
  });

  socket.on('room:voteGoToLobby', async (data: { room: { slug: string } }) => {
    console.log(`${client} wants to go to lobby on room ${data.room.slug}`);
    assert(data, 'Data is required');
    assert(data.room, 'Room data is required');
    assert(data.room.slug, 'Room slug is required');

    const { slug } = data.room;
    if (DEBUG) {
      console.log('[DEBUG] room:voteGoToLobby event:', {
        clientId: client.id,
        username: client.username,
        slug,
        time: new Date().toISOString()
      });
    }

    const room = await roomService.getRoom(slug);
    if (!room) {
      console.error(`${client} tried to go to lobby on room ${slug} but it doesn't exist!`);
      return;
    }

    console.log(`${client} in ${room.slug} wants to go to lobby.`);

    // Make sure room exists
    if (!room) {
      console.error(`${client} tried to go to lobby on room ${slug} but it doesn't exist anymore!`);
      return;
    }

    room.clickedOkResults[client.id] = true;
    room.updateRoom();

    // Check if everyone is ready to go to lobby and start new game if so
    if (room.isEveryoneReadyToGoToLobby()) {
      room.setUpNewGame();
    }
  });

  socket.on('room:singlePlayer', async () => {
    console.log(`${client} wants to start a single player game.`);
    if (DEBUG) {
      console.log('[DEBUG] room:singlePlayer event:', {
        clientId: client.id,
        username: client.username,
        time: new Date().toISOString()
      });
    }
    const room = Room.createSinglePlayerRoom(client, io);
    room.name = 'Single Player Room';
    room.slug = 'single-player';

    // add random number to name but make sure unique
    while (await roomService.getRoom(room.slug)) {
      room.slug += Math.floor(Math.random() * 1000000);
    }

    console.log(`Created single player room ${room.slug}`);

    await roomService.createRoom(room.slug, 1, client);

    // TODO: DRY this
    let [joined, message] = room.addClient(client);

    if (joined) {
      // join the room by slug
      socket.join(room.slug);

      // send success
      console.log(`${client} joined ${room}.`);
      client.send('room:data', room);
      client.message('Room created.');
    } else {
      // Failed to join room, send error msg
      console.log(`${client} failed to join ${room} - ${message}.`);
      io.to(socket.id).emit('error', 'Room created but not joined.');
    }
  });

  socket.on('room:joinRandomRoom', async () => {
    console.log(`${client.username} is joining a random room`);
    if (DEBUG) {
      const rooms = await roomService.getAllRooms();
      console.log('[DEBUG] room:joinRandomRoom event:', {
        clientId: client.id,
        username: client.username,
        availableRooms: rooms.length,
        time: new Date().toISOString()
      });
    }

    // Make sure there are rooms to join
    const rooms = await roomService.getAllRooms();
    if (rooms.length === 0) {
      io.to(socket.id).emit('error', `There are no rooms to join!`);
      return;
    }

    // Get a random room
    const room = rooms[Math.floor(Math.random() * rooms.length)];

    // Try to join the room
    let [joined, message] = room.addClient(client);

    // Send success or error
    if (joined) {
      // join the room by slug
      socket.join(room.slug);

      // send success
      console.log(`${client} joined ${room}.`);
      io.to(socket.id).emit('room:data', room);
      io.to(socket.id).emit('message', 'Room created.');
    } else {
      // Failed to join room, send error msg
      console.log(`${client} failed to join ${room} - ${message}.`);
      io.to(socket.id).emit('error', 'Room created but not joined.');
    }
  });
});

app.listen({ port: SERVER_PORT, host: SERVER_HOST }, error => {
  if (error) throw error;
  Logger.log(`Server listening on ${SERVER_HOST}:${SERVER_PORT}`);
});
