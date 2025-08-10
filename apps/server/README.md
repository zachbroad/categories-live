# Categories LIVE Server

A real-time multiplayer game server built with Node.js, Socket.IO, and PostgreSQL.

## Setup

### Prerequisites

- Node.js v20+
- PostgreSQL 14+
- pnpm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up PostgreSQL database:

```bash
createdb categories_live
```

3. Copy the environment file and configure:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:

```bash
pnpm run db:migrate
```

### Development

Start the development server:

```bash
pnpm run dev
```

### Production

Build and start:

```bash
pnpm run build
pnpm start
```

## Database

The application uses PostgreSQL for persistence and horizontal scaling via Socket.IO's PostgreSQL adapter.

### Migration Commands

- `pnpm run db:migrate` - Run pending migrations
- `pnpm run db:create <name>` - Create a new migration
- `pnpm run db:down` - Rollback last migration

### Schema

- **rooms** - Game rooms
- **clients** - Connected clients
- **games** - Game instances
- **game_prompts** - Questions/prompts for each game round
- **game_answers** - Player answers and scores
- **chat_messages** - Room chat history
- **socket_io_attachments** - Socket.IO adapter table for horizontal scaling

## Environment Variables

See `.env.example` for all configuration options:

- `DATABASE_URL` - PostgreSQL connection string
- `SERVER_HOST` - Server host (default: 0.0.0.0)
- `SERVER_PORT` - Server port (default: 3001)
- `OPENAI_API_KEY` - OpenAI API key for scoring

## Architecture

The server uses:

- **Fastify** for HTTP server
- **Socket.IO** for real-time communication
- **PostgreSQL** for data persistence
- **Socket.IO PostgreSQL Adapter** for horizontal scaling
- **Repository Pattern** for data access layer
- **Dependency Injection** via DIContainer

## Docker Support

Use the included `Dockerfile` and `compose.yaml` for containerized deployment.
