-- Migration: Create client_assignments table for Admin Access Control System
-- This table tracks which admin team members are assigned to which clients
-- Only assigned admin team members can access their assigned clients
-- Superadmins have access to all clients regardless of assignments
-- Run this script in your Neon database console (https://console.neon.tech)

-- Create client_assignments table
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
CREATE INDEX IF NOT EXISTS idx_client_assignments_assigned_date ON client_assignments(assigned_date);

-- Add comments for better documentation
COMMENT ON TABLE client_assignments IS 'Tracks admin team assignments to clients for access control';
COMMENT ON COLUMN client_assignments.admin_id IS 'ID of admin team member assigned to client';
COMMENT ON COLUMN client_assignments.client_id IS 'ID of client being assigned';
COMMENT ON COLUMN client_assignments.assigned_date IS 'When the assignment was made';
COMMENT ON COLUMN client_assignments.assigned_by IS 'ID of superadmin who made the assignment';

-- Verify the table was created
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'client_assignments' 
ORDER BY ordinal_position;

-- Check if table exists and is empty
SELECT COUNT(*) as assignment_count FROM client_assignments;

-- Show table constraints
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'client_assignments'; 