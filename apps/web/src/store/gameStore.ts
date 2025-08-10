import { create } from 'zustand';

import type { ChatMessage, Room } from '../types/socket';

interface GameState {
  // Connection state
  connected: boolean;
  username: string;
  clientId: string | null;

  // Room state
  currentRoom: Room | null;
  availableRooms: Room[];

  // Messages
  messages: string[];

  // Actions
  setConnected: (connected: boolean) => void;
  setUsername: (username: string) => void;
  setClientId: (id: string) => void;
  setCurrentRoom: (room: Room | null) => void;
  setAvailableRooms: (rooms: Room[]) => void;
  addMessage: (message: string) => void;
  clearMessages: () => void;
  updateRoomChat: (message: ChatMessage) => void;
  reset: () => void;
}

const initialState = {
  connected: false,
  username: 'Guest',
  clientId: null,
  currentRoom: null,
  availableRooms: [],
  messages: []
};

export const useGameStore = create<GameState>(set => ({
  ...initialState,

  setConnected: connected => set({ connected }),
  setUsername: username => set({ username }),
  setClientId: id => set({ clientId: id }),
  setCurrentRoom: room => set({ currentRoom: room }),
  setAvailableRooms: rooms => set({ availableRooms: rooms }),
  addMessage: message =>
    set(state => ({
      messages: [...state.messages, message]
    })),
  clearMessages: () => set({ messages: [] }),
  updateRoomChat: message =>
    set(state => ({
      currentRoom: state.currentRoom
        ? {
          ...state.currentRoom,
          chat: [...state.currentRoom.chat, message]
        }
        : null
    })),
  reset: () => set(initialState)
}));
