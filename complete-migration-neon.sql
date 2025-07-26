-- ===============================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Run this script in Neon Console (https://console.neon.tech)
-- This script includes ALL missing database changes:
-- 1. Add chat_enabled column to users table
-- 2. Create client_assignments table
-- ===============================================

-- MIGRATION 1: Add chat_enabled column to users table
-- (Required for Chat Disable/Enable Feature)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS chat_enabled BOOLEAN DEFAULT true;

-- Set default value for existing users
UPDATE users 
SET chat_enabled = true 
WHERE chat_enabled IS NULL;

-- Add constraint to ensure never null
ALTER TABLE users 
ALTER COLUMN chat_enabled SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_chat_enabled ON users(chat_enabled);

-- Add documentation
COMMENT ON COLUMN users.chat_enabled IS 'Controls whether user can send chat messages. Admin can always send regardless of this setting.';

-- MIGRATION 2: Create client_assignments table
-- (Required for Admin Access Control System)
CREATE TABLE IF NOT EXISTS client_assignments (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT NOW(),
  assigned_by VARCHAR NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate assignments
  UNIQUE(admin_id, client_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_assignments_admin_id ON client_assignments(admin_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_client_id ON client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assignments_assigned_by ON client_assignments(assigned_by);

-- Add table documentation
COMMENT ON TABLE client_assignments IS 'Tracks admin team assignments to clients for access control. Super Admins can access all clients regardless of assignments.';
COMMENT ON COLUMN client_assignments.admin_id IS 'ID of admin team member assigned to client';
COMMENT ON COLUMN client_assignments.client_id IS 'ID of client being assigned';
COMMENT ON COLUMN client_assignments.assigned_by IS 'ID of superadmin who made the assignment';

-- ===============================================
-- VERIFICATION QUERIES
-- Run these to confirm migrations were successful
-- ===============================================

-- Verify chat_enabled column exists and all users have it enabled by default
SELECT 
    'chat_enabled_column' as check_type,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'chat_enabled';

-- Check chat_enabled values distribution
SELECT 
    'chat_enabled_values' as check_type,
    chat_enabled,
    COUNT(*) as user_count
FROM users 
GROUP BY chat_enabled;

-- Verify client_assignments table structure
SELECT 
    'client_assignments_structure' as check_type,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'client_assignments' 
ORDER BY ordinal_position;

-- Check client_assignments table is empty initially
SELECT 
    'client_assignments_count' as check_type,
    COUNT(*) as assignments_count 
FROM client_assignments;

-- Verify foreign key constraints
SELECT
    'foreign_key_constraints' as check_type,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'client_assignments' AND tc.constraint_type = 'FOREIGN KEY';

-- ===============================================
-- EXPECTED RESULTS:
-- 1. chat_enabled_column: Should show column exists as BOOLEAN, NOT NULL, DEFAULT true
-- 2. chat_enabled_values: Should show all users have chat_enabled = true
-- 3. client_assignments_structure: Should show all 7 columns with proper types
-- 4. client_assignments_count: Should show 0 (empty table initially)
-- 5. foreign_key_constraints: Should show references to users(id) and clients(id)
-- ===============================================

-- Success message
SELECT '✅ MIGRATION COMPLETED SUCCESSFULLY! 🎉' as status; 