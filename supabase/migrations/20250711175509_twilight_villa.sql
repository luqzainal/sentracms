/*
  # Fix calendar events INSERT policy

  1. Security Changes
    - Add INSERT policy for calendar_events table to allow authenticated users to create events
    - Ensures users can only insert events for clients they have access to based on their role

  2. Policy Details
    - Super Admin and Team: Can insert events for any client
    - Client Admin and Client Team: Can only insert events for their own client
*/

-- Add INSERT policy for calendar_events table
CREATE POLICY "Users can insert calendar events based on role"
  ON calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Super Admin and Team can insert events for any client
    (get_user_role(auth.uid()) = ANY (ARRAY['Super Admin'::text, 'Team'::text]))
    OR
    -- Client users can only insert events for their own client
    (
      get_user_role(auth.uid()) = ANY (ARRAY['Client Admin'::text, 'Client Team'::text])
      AND get_user_client_id(auth.uid()) = client_id
    )
  );