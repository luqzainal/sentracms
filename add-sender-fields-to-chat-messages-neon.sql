-- Add sender fields to chat_messages table
-- This migration adds sender_id, sender_name, and sender_role columns to store actual sender information

ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS sender_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS sender_role VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN chat_messages.sender_id IS 'UUID reference to users.id for admin messages';
COMMENT ON COLUMN chat_messages.sender_name IS 'Name of the sender';
COMMENT ON COLUMN chat_messages.sender_role IS 'Role of the sender (for admin messages)';

-- Create index on sender_id for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id); 