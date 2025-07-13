/*
  # Fix RLS Infinite Recursion

  This migration resolves the infinite recursion error in RLS policies by:
  1. Creating a SECURITY DEFINER function to safely get user roles
  2. Updating all RLS policies to use this function instead of direct table queries
  
  ## Changes Made
  - Created `get_user_role` function with SECURITY DEFINER
  - Updated users table policies to use the function
  - Updated clients table policies to use the function
  - Maintained proper access control while eliminating recursion
*/

-- Create a SECURITY DEFINER function to safely get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Create a helper function to get user's client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_client_id integer;
BEGIN
  SELECT client_id INTO user_client_id FROM public.users WHERE id = user_id;
  RETURN user_client_id;
END;
$$;

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_client_id(uuid) TO authenticated;

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Super Admin can access all users" ON public.users;
DROP POLICY IF EXISTS "Team can read all users" ON public.users;

-- Create new policies for users table using the SECURITY DEFINER function
CREATE POLICY "Super Admin can access all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'Super Admin'::text);

CREATE POLICY "Team can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['Team'::text, 'Super Admin'::text]));

-- Note: "Users can read their own data" policy (auth.uid() = id) is already safe and doesn't need changes

-- Drop existing policies on clients table
DROP POLICY IF EXISTS "Client Admin can access their client" ON public.clients;
DROP POLICY IF EXISTS "Client Team can read their client" ON public.clients;
DROP POLICY IF EXISTS "Super Admin can access all clients" ON public.clients;
DROP POLICY IF EXISTS "Team can access all clients" ON public.clients;

-- Create new policies for clients table using the SECURITY DEFINER functions
CREATE POLICY "Client Admin can access their client"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'Client Admin'::text 
    AND get_user_client_id(auth.uid()) = clients.id
  );

CREATE POLICY "Client Team can read their client"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'Client Team'::text 
    AND get_user_client_id(auth.uid()) = clients.id
  );

CREATE POLICY "Super Admin can access all clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'Super Admin'::text);

CREATE POLICY "Team can access all clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'Team'::text);