
-- Update RLS policies to allow all authenticated users to view projects and support data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;

-- Update projects policies to allow all authenticated users
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
CREATE POLICY "All authenticated users can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- Update project members policies
DROP POLICY IF EXISTS "Anyone can view project members" ON public.project_members;
CREATE POLICY "All authenticated users can view project members" ON public.project_members
  FOR SELECT TO authenticated USING (true);

-- Update support requests policies
DROP POLICY IF EXISTS "Anyone can view support requests" ON public.support_requests;
CREATE POLICY "All authenticated users can view support requests" ON public.support_requests
  FOR SELECT TO authenticated USING (true);

-- Update support comments policies
DROP POLICY IF EXISTS "Anyone can view support comments" ON public.support_comments;
CREATE POLICY "All authenticated users can view support comments" ON public.support_comments
  FOR SELECT TO authenticated USING (true);

-- Update transactions policies to allow users to view transactions related to projects they can see
CREATE POLICY "Users can view all completed transactions" ON public.transactions
  FOR SELECT TO authenticated USING (status = 'completed');

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to view profiles of other users (for displaying names)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "All authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Keep the update policy restrictive to own profile only (only drop and recreate if needed)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
