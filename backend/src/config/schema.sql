-- Knight Chase Game Database Schema

-- Game state table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  current_player VARCHAR(10) NOT NULL CHECK (current_player IN ('red', 'blue')),
  red_position_x INTEGER CHECK (red_position_x >= 0 AND red_position_x < 8),
  red_position_y INTEGER CHECK (red_position_y >= 0 AND red_position_y < 8),
  blue_position_x INTEGER CHECK (blue_position_x >= 0 AND blue_position_x < 8),
  blue_position_y INTEGER CHECK (blue_position_y >= 0 AND blue_position_y < 8),
  blocked_squares JSONB DEFAULT '[]'::jsonb,
  game_status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (game_status IN ('in_progress', 'red_wins', 'blue_wins', 'abandoned', 'red_blocked', 'blue_blocked')),
  turn_number INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  red_wins INTEGER DEFAULT 0,
  blue_wins INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize scores if not exists
INSERT INTO scores (red_wins, blue_wins, total_games)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM scores LIMIT 1);

-- Game history table
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id),
  winner VARCHAR(10) CHECK (winner IN ('red', 'blue')),
  total_turns INTEGER,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
