-- Migration: Add deadline fields for parent items (Onboarding, First Draft, Second Draft)
-- Date: 2024-12-19

-- Add new deadline columns to progress_steps table
ALTER TABLE progress_steps 
ADD COLUMN IF NOT EXISTS onboarding_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_draft_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS second_draft_deadline TIMESTAMPTZ;

-- Add completion status columns for each deadline
ALTER TABLE progress_steps 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_draft_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS second_draft_completed BOOLEAN DEFAULT false;

-- Add completion date columns for each deadline
ALTER TABLE progress_steps 
ADD COLUMN IF NOT EXISTS onboarding_completed_date DATE,
ADD COLUMN IF NOT EXISTS first_draft_completed_date DATE,
ADD COLUMN IF NOT EXISTS second_draft_completed_date DATE;

-- Update existing package setup steps with default deadlines
UPDATE progress_steps 
SET 
  onboarding_deadline = deadline + INTERVAL '7 days',
  first_draft_deadline = deadline + INTERVAL '14 days',
  second_draft_deadline = deadline + INTERVAL '21 days'
WHERE title LIKE '% - Package Setup%';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_progress_steps_deadlines 
ON progress_steps (onboarding_deadline, first_draft_deadline, second_draft_deadline);

-- Add comments to document the new columns
COMMENT ON COLUMN progress_steps.onboarding_deadline IS 'Deadline for client onboarding phase';
COMMENT ON COLUMN progress_steps.first_draft_deadline IS 'Deadline for first draft delivery';
COMMENT ON COLUMN progress_steps.second_draft_deadline IS 'Deadline for second draft delivery';
COMMENT ON COLUMN progress_steps.onboarding_completed IS 'Whether onboarding phase is completed';
COMMENT ON COLUMN progress_steps.first_draft_completed IS 'Whether first draft is completed';
COMMENT ON COLUMN progress_steps.second_draft_completed IS 'Whether second draft is completed'; 