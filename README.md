# Categories.LIVE

Real-time multiplayer word game built with React, Socket.IO, and GPT-4.

Players join rooms, receive a category, and race to submit answers. Responses are scored in real time using OpenAI, and results are displayed live to all participants.

## Features

- Real-time multiplayer gameplay with Socket.IO rooms and live chat
- AI-powered answer scoring via OpenAI (GPT-4)
- Game state machine managing lobby, active rounds, scoring, and results
- Responsive React client with Zustand state management
- Horizontally scalable server with PostgreSQL-backed adapters and Terraform infrastructure

## Tech Stack

**Client:** React 18, React Router v7 (SSR), Tailwind CSS v4, Zustand, Socket.IO Client, Vite

**Server:** Node.js, Fastify, Socket.IO, OpenAI SDK, PostgreSQL, Awilix (DI), Zod

**Infrastructure:** Turborepo, pnpm workspaces, Docker, Terraform (AWS), Netlify

## Getting Started

### Prerequisites

- Node.js >= 20.10
- pnpm 9.x

### Install

```sh
pnpm install
```

### Development

```sh
# Start all apps (web client + game server)
pnpm dev

# Or run individually
pnpm --filter=@categories/web dev
pnpm --filter=@categories/server dev
```

The server requires environment variables for PostgreSQL and OpenAI. Copy `.env.example` (if available) or configure:

- `DATABASE_URL` -- PostgreSQL connection string
- `OPENAI_API_KEY` -- OpenAI API key for answer scoring

### Build

```sh
pnpm build
```

## Project Structure

```
apps/
  web/       React Router v7 client (Netlify deployment)
  server/    Socket.IO game server (Docker deployment)
packages/
  ui/        Shared component library (Shadcn UI)
  *-config/  Shared ESLint, TypeScript, Prettier, Tailwind, Vite configs
infra/       Terraform configuration for AWS
```

## License

MIT
