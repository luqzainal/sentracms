/*
  # Add package name and tags to clients table

  1. Schema Changes
    - Add `package_name` column to store client package information
    - Add `tags` column to store client tags as text array
    - Remove old `project_management` and `marketing_automation` columns

  2. Data Migration
    - Safely handle existing data during column changes
*/

-- Add new columns
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS package_name text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Remove old columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'project_management'
  ) THEN
    ALTER TABLE clients DROP COLUMN project_management;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'marketing_automation'
  ) THEN
    ALTER TABLE clients DROP COLUMN marketing_automation;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_package_name ON clients(package_name);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);