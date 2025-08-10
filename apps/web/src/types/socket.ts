import type { Socket } from 'socket.io-client';

// Room Status enum
export enum RoomStatus {
  Waiting = 'Waiting',
  Starting = 'Starting',
  InProgress = 'InProgress',
  Scoring = 'Scoring',
  Results = 'Results'
}

// Chat Message
export interface ChatMessage {
  username: string;
  message: string;
  timestamp: Date;
}

// Client/Player
export interface Client {
  id: string;
  username: string;
  address?: string;
  roomSlug?: string | null;
}

// Game
export interface Game {
  id?: string;
  currentRound: number;
  rounds: number;
  letter: string;
  currentPrompts: string[];
  results: Record<
    string,
    {
      answers?: string[];
      results?: number[];
    }
  >;
  hasBeenScored?: boolean;
}

// Room
export interface Room {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  status: RoomStatus;
  clients: Client[];
  owner: Client | null;
  chat: ChatMessage[];
  scores: Record<string, number>;
  clickedOkResults: Record<string, boolean>;
  game: Game | null;
  isPublic: boolean;
  currentRound: number;
}

// Socket.IO Event Types
export interface ServerToClientEvents {
  message: (message: string) => void;
  error: (message: string) => void;
  'room:data': (room: Room) => void;
  'room:chatMessage': (message: ChatMessage) => void;
  roomList: (rooms: Room[]) => void;
}

export interface ClientToServerEvents {
  'global:message': (message: string) => void;
  'global:roomList': () => void;
  'global:changeName': (name: string) => void;
  'room:create': (slug: string) => void;
  'room:data': (room: Room) => void;
  'room:join': (slug: string) => void;
  'room:chatMessage': (message: string) => void;
  'room:startGame': (data: { slug: string }) => void;
  'room:provideAnswers': (data: { slug: string; answers: string[] }) => void;
  'room:leave': (data: { slug: string }) => void;
  'room:voteGoToLobby': (data: { room: { slug: string } }) => void;
  'room:singlePlayer': () => void;
  'room:joinRandomRoom': () => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
