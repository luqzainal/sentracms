-- Migration: Add client_pics table for multi-PIC support
-- This allows clients to have multiple PICs (up to 10 total)

-- Create client_pics table
CREATE TABLE IF NOT EXISTS client_pics (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pic_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 3 AND position <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, position),
  UNIQUE(client_id, pic_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_pics_client_id ON client_pics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_pics_position ON client_pics(position);
CREATE INDEX IF NOT EXISTS idx_client_pics_pic_id ON client_pics(pic_id);

-- Add constraint to ensure max 10 PICs per client (2 existing + 8 new)
-- This will be enforced in application logic 