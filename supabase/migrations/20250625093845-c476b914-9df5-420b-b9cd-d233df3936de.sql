
-- Fix RLS policies by first dropping ALL existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can join projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view support requests from their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests in their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can view comments on accessible support requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can create support comments on accessible requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can view profiles of project members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all completed transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;

-- Create simple, non-recursive policies
-- Allow all authenticated users to view profiles (needed for the app to work)
CREATE POLICY "All authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow all authenticated users to view projects
CREATE POLICY "All authenticated users can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- Allow users to create projects
CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

-- Allow project admins to update projects
CREATE POLICY "Project admins can update projects" ON public.projects
  FOR UPDATE TO authenticated USING (auth.uid() = admin_id);

-- Allow all authenticated users to view project members
CREATE POLICY "All authenticated users can view project members" ON public.project_members
  FOR SELECT TO authenticated USING (true);

-- Allow users to join projects
CREATE POLICY "Users can join projects" ON public.project_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to view support requests
CREATE POLICY "All authenticated users can view support requests" ON public.support_requests
  FOR SELECT TO authenticated USING (true);

-- Allow users to create support requests
CREATE POLICY "Users can create support requests" ON public.support_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

-- Allow all authenticated users to view support comments
CREATE POLICY "All authenticated users can view support comments" ON public.support_comments
  FOR SELECT TO authenticated USING (true);

-- Allow users to create support comments
CREATE POLICY "Users can create support comments" ON public.support_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow users to view all completed transactions
CREATE POLICY "Users can view all completed transactions" ON public.transactions
  FOR SELECT TO authenticated USING (status = 'completed');

-- Allow users to create their own transactions
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
