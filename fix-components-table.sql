-- Fix components table: Add missing invoice_id column
-- Run this script in your Neon database console

-- Add invoice_id column to components table
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS invoice_id text;

-- Add foreign key constraint (optional, but recommended)
-- ALTER TABLE components 
-- ADD CONSTRAINT fk_components_invoice_id 
-- FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_components_invoice_id ON components(invoice_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'components' 
ORDER BY ordinal_position; 