
-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can join projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view support requests from their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Users can create support requests in their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Users can view comments on accessible support requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can create support comments" ON public.support_comments;
DROP POLICY IF EXISTS "Users can create support comments on accessible requests" ON public.support_comments;
DROP POLICY IF EXISTS "Users can view profiles of project members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all completed transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;

-- Create new restrictive project-based policies
CREATE POLICY "Users can view projects they are members of" ON public.projects
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Project admins can update projects" ON public.projects
  FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Users can view members of their projects" ON public.project_members
  FOR SELECT TO authenticated USING (
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join projects" ON public.project_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view support requests from their projects" ON public.support_requests
  FOR SELECT TO authenticated USING (
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create support requests in their projects" ON public.support_requests
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = requester_id AND
    project_id IN (
      SELECT project_id FROM public.project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view comments on accessible support requests" ON public.support_comments
  FOR SELECT TO authenticated USING (
    support_request_id IN (
      SELECT sr.id FROM public.support_requests sr
      WHERE sr.project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create support comments on accessible requests" ON public.support_comments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    support_request_id IN (
      SELECT sr.id FROM public.support_requests sr
      WHERE sr.project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view profiles of project members" ON public.profiles
  FOR SELECT TO authenticated USING (
    id IN (
      SELECT DISTINCT pm.user_id 
      FROM public.project_members pm
      WHERE pm.project_id IN (
        SELECT project_id FROM public.project_members 
        WHERE user_id = auth.uid()
      )
    ) OR id = auth.uid()
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view all completed transactions" ON public.transactions
  FOR SELECT TO authenticated USING (status = 'completed');

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
