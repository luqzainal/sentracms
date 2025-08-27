-- ===============================================
-- UPDATE CALENDAR EVENTS TYPE CONSTRAINT MIGRATION
-- This migration updates the calendar_events type constraint 
-- to include new event types: 1st draft and 2nd draft
-- ===============================================

-- Drop existing constraint
ALTER TABLE calendar_events 
DROP CONSTRAINT IF EXISTS calendar_events_type_check;

-- Add updated constraint with new event types
ALTER TABLE calendar_events 
ADD CONSTRAINT calendar_events_type_check 
CHECK (type IN ('onboarding', 'firstdraft', 'seconddraft', 'handover'));

-- Add comment for documentation
COMMENT ON CONSTRAINT calendar_events_type_check ON calendar_events 
IS 'Ensures event type is one of: onboarding, firstdraft (1st Draft), seconddraft (2nd Draft), or handover';

-- ===============================================
-- VERIFICATION QUERY
-- Run this to confirm constraint was updated successfully
-- ===============================================

-- Check current constraint definition
SELECT 
    'calendar_events_constraint_check' as check_type,
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'calendar_events' 
AND conname = 'calendar_events_type_check';

-- Test constraint with valid values
DO $$
BEGIN
    -- This should succeed (just a test, no actual insert)
    PERFORM 'onboarding'::text WHERE 'onboarding' IN ('onboarding', 'firstdraft', 'seconddraft', 'handover');
    PERFORM 'firstdraft'::text WHERE 'firstdraft' IN ('onboarding', 'firstdraft', 'seconddraft', 'handover');
    PERFORM 'seconddraft'::text WHERE 'seconddraft' IN ('onboarding', 'firstdraft', 'seconddraft', 'handover');
    PERFORM 'handover'::text WHERE 'handover' IN ('onboarding', 'firstdraft', 'seconddraft', 'handover');
    
    RAISE NOTICE '✅ All event types are valid in constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Constraint validation failed: %', SQLERRM;
END
$$;

-- Success message
SELECT '✅ CALENDAR EVENTS CONSTRAINT MIGRATION COMPLETED! 🎉' as status;