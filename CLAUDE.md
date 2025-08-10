# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Categories.LIVE is a Turborepo monorepo containing a real-time multiplayer game with a React Router v7 web client and a Node.js/Socket.IO game server.

## Tech Stack

- **Tailwind CSS v4** with @tailwindcss/vite plugin for styling
- **React Router v7** for the web application framework
- **Socket.IO** for real-time game server
- **Turborepo** for monorepo management

## Key Commands

### Development
```bash
# Start all development servers
pnpm dev

# Start specific app
pnpm --filter=web dev        # Web client on port 3000
pnpm --filter=scatterserver-ts dev  # Game server
```

### Building
```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter=web build
pnpm --filter=scatterserver-ts build
```

### Testing
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Specific app tests
pnpm --filter=web test
```

### Linting & Formatting
```bash
# Lint all code
pnpm lint

# Format code
pnpm format

# Type checking (web app)
pnpm --filter=web typecheck
```

### UI Components
```bash
# Add Shadcn UI components
pnpm ui add [component-name]
```

## Architecture

### Monorepo Structure
- **Turborepo** manages the monorepo with shared configurations
- **pnpm workspaces** for dependency management
- Node.js >= 20.10.0 required

### Apps

#### `apps/web` - React Router v7 Client
- React Router v7 with SSR support
- TailwindCSS + Sass styling
- Vite bundler
- Netlify deployment ready
- Testing with Vitest and React Testing Library

#### `apps/server` - Game Server
- Real-time multiplayer game server using Socket.IO
- AWS integration (DynamoDB, SNS, SQS) for scaling
- OpenAI integration for game scoring
- Docker support for containerized deployment
- Key components:
  - `DIContainer`: Dependency injection container managing services
  - `ClientService`: Manages connected clients
  - `RoomService`: Manages game rooms
  - `GameStateMachine`: Handles game state transitions
  - Socket event handlers for room management, chat, and gameplay

### Shared Packages
- `@repo/ui`: Shared UI components library with Shadcn
- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configs
- `@repo/prettier-config`: Shared Prettier config
- `@repo/stylelint-config`: Shared Stylelint config
- `@repo/tailwind-config`: Shared Tailwind CSS config
- `@repo/vite-config`: Shared Vite configuration

## Game Server Architecture

### Core Services
- **ClientService**: Manages client connections and state (in-memory or DynamoDB)
- **RoomService**: Manages game rooms and their lifecycle (in-memory or DynamoDB)
- **Socket.IO Integration**: Real-time bidirectional communication with AWS SQS adapter for horizontal scaling

### Key Socket Events
- `global:*` - Global server events (message, roomList, changeName)
- `room:*` - Room management (create, join, leave, data)
- `room:chatMessage` - In-room chat
- `room:startGame` - Initialize game session
- `room:provideAnswers` - Submit player answers
- `room:voteGoToLobby` - Ready check for next round

### Game Flow
1. Clients connect and can create/join rooms
2. Room host starts the game
3. Players submit answers
4. Server scores answers using OpenAI
5. Results displayed, players vote to continue

## Development Notes

- The server uses AWS services that require environment variables (AWS credentials)
- Both apps have CORS configured for `*` - update for production
- Server uses OpenAI for scoring - requires API key
- Git hooks via Husky enforce commit conventions (Conventional Commits)
- Lint-staged runs on pre-commit