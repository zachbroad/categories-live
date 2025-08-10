import Room from './Room';

export interface ClientToServerEvents {
  connection: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  // leaveRoom: (roomId: string) => void;
}

export interface ServerToClientEvents {
  roomList: (rooms: Room[]) => void;
  message: (message: string) => void;
  'room:data': (room: Room) => void;
  error: (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user_id: string;
}
