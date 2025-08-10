import { createContainer, asClass, asValue, InjectionMode, AwilixContainer } from 'awilix';
import { Server } from 'socket.io';
import { Pool } from 'pg';
import ClientService from './ClientService';
import RoomService from './RoomService';
import ClientRepositoryPostgres from './ClientRepositoryPostgres';
import RoomRepositoryPostgres from './RoomRepositoryPostgres';
import ClientRepositoryMemory from './ClientRepositoryMemory';
import RoomRepositoryMemory from './RoomRepositoryMemory';

export interface Dependencies {
  io: Server;
  pool?: Pool;
  clientRepository: any;
  roomRepository: any;
  clientService: ClientService;
  roomService: RoomService;
}

let container: AwilixContainer<Dependencies>;

export function initializeContainer(io: Server, pool?: Pool): AwilixContainer<Dependencies> {
  container = createContainer<Dependencies>({
    injectionMode: InjectionMode.PROXY,
    strict: true
  });

  // Register the Socket.IO server instance
  container.register({
    io: asValue(io)
  });

  // Register database pool if provided
  if (pool) {
    container.register({
      pool: asValue(pool)
    });
  }

  // Register repositories based on whether we have a database pool
  if (pool) {
    container.register({
      clientRepository: asClass(ClientRepositoryPostgres).singleton(),
      roomRepository: asClass(RoomRepositoryPostgres).singleton()
    });
  } else {
    container.register({
      clientRepository: asClass(ClientRepositoryMemory).singleton(),
      roomRepository: asClass(RoomRepositoryMemory).singleton()
    });
  }

  // Register services
  container.register({
    clientService: asClass(ClientService).singleton(),
    roomService: asClass(RoomService).singleton()
  });

  return container;
}

export function getContainer(): AwilixContainer<Dependencies> {
  if (!container) {
    throw new Error('Container has not been initialized. Call initializeContainer first.');
  }
  return container;
}