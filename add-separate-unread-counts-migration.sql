-- Migration: Add separate unread counts for client and admin
-- This allows proper notification logic where:
-- - client_unread_count increments when admin sends message
-- - admin_unread_count increments when client sends message

-- Add new columns to chats table
ALTER TABLE chats 
ADD COLUMN client_unread_count INTEGER DEFAULT 0,
ADD COLUMN admin_unread_count INTEGER DEFAULT 0;

-- Update existing chats to have proper initial values
-- For existing chats, we'll set both to 0 since we can't determine historical unread status
UPDATE chats 
SET client_unread_count = 0, 
    admin_unread_count = 0;

-- Create index for better performance
CREATE INDEX idx_chats_client_unread ON chats(client_unread_count);
CREATE INDEX idx_chats_admin_unread ON chats(admin_unread_count);

-- Update the sendMessage function logic
-- Note: This will be handled in the application code 