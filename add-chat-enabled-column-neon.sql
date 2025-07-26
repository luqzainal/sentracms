-- Migration: Add chat_enabled column to users table for Chat Disable/Enable Feature
-- This column controls whether clients can send messages (admin can always send)
-- Default: true (chat enabled) for all existing and new users
-- Run this script in your Neon database console (https://console.neon.tech)

-- Add chat_enabled column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true;

-- Set default value to true for any existing users (ensure no nulls)
UPDATE users 
SET chat_enabled = true 
WHERE chat_enabled IS NULL;

-- Add constraint to ensure chat_enabled is never null
ALTER TABLE users 
ALTER COLUMN chat_enabled SET NOT NULL;

-- Add comment for better documentation
COMMENT ON COLUMN users.chat_enabled IS 'Controls whether user can send chat messages. Admin can always send regardless of this setting.';

-- Create index for better performance when filtering by chat status
CREATE INDEX IF NOT EXISTS idx_users_chat_enabled ON users(chat_enabled);

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'chat_enabled';

-- Check current chat_enabled values distribution
SELECT 
    chat_enabled,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users 
GROUP BY chat_enabled
ORDER BY chat_enabled;

-- Show sample of users with chat_enabled status
SELECT 
    id,
    name,
    email,
    role,
    chat_enabled,
    status
FROM users 
ORDER BY role, name
LIMIT 10;

-- Verification: Ensure all users have chat_enabled = true by default
SELECT COUNT(*) as users_with_chat_disabled
FROM users 
WHERE chat_enabled = false;

-- Expected result: 0 users with chat disabled (all should be enabled by default) 