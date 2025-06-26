
-- First, drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "All authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are members of or created" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.projects;

DROP POLICY IF EXISTS "All authenticated users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view members of projects they belong to" ON public.project_members;
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can join projects" ON public.project_members;

DROP POLICY IF EXISTS "All authenticated users can view support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can view support requests from their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests in their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests" ON public.support_requests;

DROP POLICY IF EXISTS "All authenticated users can view support comments" ON public.support_comments;
DROP POLICY IF EXISTS "Users can view comments on accessible support requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can create support comments on accessible requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can create support comments" ON public.support_comments;

DROP POLICY IF EXISTS "All authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of project members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Now create fresh, simple policies without recursion
CREATE POLICY "authenticated_can_view_projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_create_projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "admins_can_update_projects" ON public.projects
  FOR UPDATE TO authenticated USING (auth.uid() = admin_id);

CREATE POLICY "authenticated_can_view_members" ON public.project_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_join_projects" ON public.project_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_view_support_requests" ON public.support_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_create_support_requests" ON public.support_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "authenticated_can_view_support_comments" ON public.support_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_can_create_support_comments" ON public.support_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_view_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
