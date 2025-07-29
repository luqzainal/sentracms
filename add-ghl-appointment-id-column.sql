-- Migration: Add ghl_appointment_id column to calendar_events table
-- This column stores the GHL appointment ID for synced events
-- Run this script in your Neon database console (https://console.neon.tech)

-- Add ghl_appointment_id column to calendar_events table
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS ghl_appointment_id VARCHAR(255);

-- Add comment for better documentation
COMMENT ON COLUMN calendar_events.ghl_appointment_id IS 'GoHighLevel appointment ID for synced events';

-- Create index for better performance when filtering by GHL appointment ID
CREATE INDEX IF NOT EXISTS idx_calendar_events_ghl_appointment_id ON calendar_events(ghl_appointment_id);

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'calendar_events' 
  AND column_name = 'ghl_appointment_id';

-- Show sample of events with ghl_appointment_id
SELECT 
    id,
    title,
    type,
    ghl_appointment_id,
    start_date,
    start_time
FROM calendar_events 
ORDER BY created_at desc
LIMIT 10;