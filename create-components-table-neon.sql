-- Create components table from scratch
-- Run this script in your Neon database console (https://console.neon.tech)

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id integer NOT NULL,
  invoice_id text,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_components_client_id ON components(client_id);
CREATE INDEX IF NOT EXISTS idx_components_invoice_id ON components(invoice_id);
CREATE INDEX IF NOT EXISTS idx_components_active ON components(active);

-- Add foreign key constraints (optional but recommended)
-- ALTER TABLE components ADD CONSTRAINT fk_components_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
-- ALTER TABLE components ADD CONSTRAINT fk_components_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Verify the table was created
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'components' 
ORDER BY ordinal_position;

-- Check if table exists and is empty
SELECT COUNT(*) as component_count FROM components; 