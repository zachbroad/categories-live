import 'dotenv/config';
import fastify from 'fastify';
import { Server, Socket } from 'socket.io';
import Logger from './Logger.js';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from './SocketIO.js';
import { ddb } from './DynamoDB.js';
import { MOTD, SERVER_HOST, SERVER_PORT } from './Config.js';
import { createAdapter } from '@socket.io/aws-sqs-adapter';
import { SNS } from '@aws-sdk/client-sns';
import { SQS } from '@aws-sdk/client-sqs';
import DIContainer from './DIContainer.js';
import cors from '@fastify/cors';
import Client from './Client.js';
import Room from './Room.js';
import assert from 'assert';
import ChatMessage from './ChatMessage.js';

const snsClient = new SNS();
const sqsClient = new SQS({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const app = fastify();
await app.register(cors, {
  origin: '*' // TODO: change this for production
});

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  app.server,
  {
    adapter: createAdapter(snsClient, sqsClient),
    cors: {
      origin: '*' // TODO: change this for production
    }
  }
);

await io.of('/').adapter.init();

// Removes the Queue from SQS when the server is terminated
process.on('SIGTERM', () => {
  io.close();
});

process.on('SIGINT', async () => {
  await io.close();
  process.exit(0);
});

DIContainer.initialize(ddb);
DIContainer.setSocketIO(io);

io.on('connection', (socket: Socket) => {
  console.log('Connection: ', socket.id);
  socket.emit('message', MOTD);

  const name = socket.handshake.query.name as string; // TODO: define this query as a type
  const client = new Client(socket, name, socket.handshake.address);
  DIContainer.clientService.createClient(client);

  client.message('Welcome to the server!');
  // client.sendMessageHistory();
  // client.sendListOfRooms();

  socket.on('disconnect', () => {
    DIContainer.clientService.deleteClient(client.id);
  });

  socket.on('global:message', (message: string) => {
    client.message(message);
  });

  socket.on('global:roomList', () => {
    client.sendListOfRooms();
  });

  socket.on('global:changeName', (name: string) => {
    console.log(`${client.username} is changing their name to ${name}`);
    client.username = name;
    client
      .getRoom()
      .then(room => {
        if (room) {
          DIContainer.clientService.updateClient(client);
          DIContainer.roomService.updateRoom(room);
        }
      })
      .catch(error => {
        console.error(error);
        client.error('Failed to change name');
      });
  });

  socket.on('room:create', async (slug: string) => {
    console.log(`${client.username} is creating a room with the slug ${slug}`);

    if (!slug) {
      client.error('Slug is required');
      return;
    }

    if (slug.length < 2) {
      client.error('Slug must be at least 2 characters long');
      return;
    }

    if (await DIContainer.roomService.getRoom(slug)) {
      client.error('Room with this slug already exists');
      return;
    }

    const room = await DIContainer.roomService.createRoom(slug, 10, client);
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
    let room = await DIContainer.roomService.getRoom(slug);
    console.log(`${client} wants to join ${room}`);

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
    if (!client.roomSlug) {
      client.error('You must be in a room to send chat messages!');
      return;
    }

    const room = await DIContainer.roomService.getRoom(client.roomSlug);
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
    DIContainer.socketIO.sockets.in(room.slug).emit('room:chatMessage', chatMessage);
  });

  socket.on('room:startGame', async (data: { slug: string }) => {
    assert(data, 'Data is required');
    assert(data.slug, 'Slug is required');

    const { slug } = data;

    console.log(`${client.username} requested to start a game`);
    if (!slug) {
      client.error('You must be in a room to start a game!');
      return;
    }

    // Get the room by slug
    const room = await DIContainer.roomService.getRoom(slug);
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
    const room = await DIContainer.roomService.getRoom(slug);

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
    const room = await DIContainer.roomService.getRoom(slug);

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

    const room = await DIContainer.roomService.getRoom(slug);
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
    const room = Room.createSinglePlayerRoom(client);
    room.name = 'Single Player Room';
    room.slug = 'single-player';

    // add random number to name but make sure unique
    while (await DIContainer.roomService.getRoom(room.slug)) {
      room.slug += Math.floor(Math.random() * 1000000);
    }

    console.log(`Created single player room ${room.slug}`);

    await DIContainer.roomService.createRoom(room.slug, 1, client);

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

    // Make sure there are rooms to join
    const rooms = await DIContainer.roomService.getAllRooms();
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
