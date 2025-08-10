import { io } from 'socket.io-client';

import { useGameStore } from '../store/gameStore';
import type { Room, TypedSocket } from '../types/socket';

const SOCKET_URL =
  typeof window !== 'undefined'
    ? import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    : 'http://localhost:3001';

class SocketService {
  private socket: TypedSocket | null = null;

  connect(username: string): TypedSocket {
    // Prevent SSR issues
    if (typeof window === 'undefined') {
      return {} as TypedSocket;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      query: { name: username },
      transports: ['websocket']
    }) as TypedSocket;

    this.setupEventHandlers();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useGameStore.getState().setConnected(false);
    }
  }

  getSocket(): TypedSocket | null {
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    const store = useGameStore.getState();

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      store.setConnected(true);
      if (this.socket?.id) {
        store.setClientId(this.socket.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      store.setConnected(false);
    });

    // Message events
    this.socket.on('message', message => {
      console.log('Server message:', message);
      store.addMessage(message);
    });

    this.socket.on('error', error => {
      console.error('Server error:', error);
      store.addMessage(`Error: ${error}`);
    });

    // Room events
    this.socket.on('room:data', room => {
      console.log('Room data:', room);
      store.setCurrentRoom(room);
    });

    this.socket.on('room:chatMessage', message => {
      console.log('Chat message:', message);
      store.updateRoomChat(message);
    });

    this.socket.on('roomList', (rooms: Room[]) => {
      console.log('Room list:', rooms);
      store.setAvailableRooms(rooms);
    });
  }

  // Emit methods
  createRoom(slug: string): void {
    this.socket?.emit('room:create', slug);
  }

  joinRoom(slug: string): void {
    this.socket?.emit('room:join', slug);
  }

  leaveRoom(slug: string): void {
    if (this.socket && slug) {
      this.socket.emit('room:leave', { slug });
    }
  }

  sendChatMessage(message: string): void {
    this.socket?.emit('room:chatMessage', message);
  }

  startGame(slug: string): void {
    this.socket?.emit('room:startGame', { slug });
  }

  submitAnswers(slug: string, answers: string[]): void {
    this.socket?.emit('room:provideAnswers', { slug, answers });
  }

  voteGoToLobby(slug: string): void {
    this.socket?.emit('room:voteGoToLobby', { room: { slug } });
  }

  joinRandomRoom(): void {
    this.socket?.emit('room:joinRandomRoom');
  }

  startSinglePlayer(): void {
    this.socket?.emit('room:singlePlayer');
  }

  changeName(name: string): void {
    this.socket?.emit('global:changeName', name);
  }

  requestRoomList(): void {
    this.socket?.emit('global:roomList');
  }
}

export const socketService = new SocketService();
