-- Fix components table: Add missing invoice_id column
-- Run this script in your Neon database console (https://console.neon.tech)

-- Add invoice_id column to components table
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS invoice_id text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_components_invoice_id ON components(invoice_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'components' 
ORDER BY ordinal_position;

-- Check if there are any existing components without invoice_id
SELECT id, name, client_id, invoice_id 
FROM components 
WHERE invoice_id IS NULL; 