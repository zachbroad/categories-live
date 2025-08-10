-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Socket.IO Postgres adapter table
CREATE TABLE IF NOT EXISTS socket_io_attachments (
    id          BIGSERIAL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    payload     BYTEA
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting',
    owner_id UUID,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    socket_id VARCHAR(255) UNIQUE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP WITH TIME ZONE
);

-- Create games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    current_round INTEGER NOT NULL DEFAULT 1,
    total_rounds INTEGER NOT NULL DEFAULT 3,
    letter CHAR(1) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting',
    winner_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create game_prompts table
CREATE TABLE game_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_order INTEGER NOT NULL
);

-- Create game_answers table
CREATE TABLE game_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    answers JSONB NOT NULL DEFAULT '[]',
    scores JSONB NOT NULL DEFAULT '[]',
    total_score INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, client_id, round_number)
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_rooms_slug ON rooms(slug);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_owner ON rooms(owner_id);
CREATE INDEX idx_clients_room ON clients(room_id);
CREATE INDEX idx_clients_socket ON clients(socket_id);
CREATE INDEX idx_games_room ON games(room_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_prompts_game ON game_prompts(game_id, round_number);
CREATE INDEX idx_game_answers_game ON game_answers(game_id);
CREATE INDEX idx_game_answers_client ON game_answers(client_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();