# Categories LIVE - Web Client

A React-based web client for the Categories LIVE multiplayer game.

## Features

- 🎮 Real-time multiplayer gameplay via Socket.IO
- 🏠 Room creation and management
- 💬 In-game chat
- 🎯 AI-powered answer scoring
- 📱 Responsive design with Tailwind CSS v4
- ⚛️ Built with React Router v7 and TypeScript

## Setup

### Prerequisites

- Node.js v20+
- pnpm
- Server running on port 3001

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure the Socket.IO server URL in `.env`:

```
VITE_SOCKET_URL=http://localhost:3001
```

### Development

Start the development server:

```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`.

### Production

Build for production:

```bash
pnpm run build
```

## Game Flow

1. **Landing Page** - Enter your username
2. **Home Page** - View available rooms, create new room, or join existing
3. **Lobby** - Wait for players, chat, start game (host only)
4. **Game** - Answer prompts with words starting with the given letter
5. **Results** - View scores and rankings

## Tech Stack

- **React 18** - UI framework
- **React Router v7** - Routing and SSR
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm typecheck` - Run TypeScript checks
- `pnpm test` - Run tests
- `pnpm lint` - Run linters
