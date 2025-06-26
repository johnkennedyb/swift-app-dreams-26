
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "All authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "All authenticated users can view project members" ON public.project_members;
DROP POLICY IF EXISTS "All authenticated users can view support requests" ON public.support_requests;
DROP POLICY IF EXISTS "All authenticated users can view support comments" ON public.support_comments;

-- Create restrictive policies for projects - users can only see projects they are members of or created
CREATE POLICY "Users can view projects they are members of or created" ON public.projects
  FOR SELECT TO authenticated USING (
    auth.uid() = admin_id OR 
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
    )
  );

-- Create restrictive policy for project members - users can only see members of projects they belong to
CREATE POLICY "Users can view members of projects they belong to" ON public.project_members
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm2 
      WHERE pm2.project_id = project_members.project_id AND pm2.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_members.project_id AND p.admin_id = auth.uid()
    )
  );

-- Create restrictive policy for support requests - users can only see requests from projects they are members of
CREATE POLICY "Users can view support requests from their projects" ON public.support_requests
  FOR SELECT TO authenticated USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = support_requests.project_id AND pm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = support_requests.project_id AND p.admin_id = auth.uid()
    )
  );

-- Update support request creation policy to ensure users can only create requests for projects they belong to
DROP POLICY IF EXISTS "Users can create support requests" ON public.support_requests;
CREATE POLICY "Users can create support requests in their projects" ON public.support_requests
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = requester_id AND
    (EXISTS (
      SELECT 1 FROM public.project_members pm 
      WHERE pm.project_id = support_requests.project_id AND pm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = support_requests.project_id AND p.admin_id = auth.uid()
    ))
  );

-- Create restrictive policy for support comments - users can only see comments on support requests they can access
CREATE POLICY "Users can view comments on accessible support requests" ON public.support_comments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.support_requests sr
      WHERE sr.id = support_comments.support_request_id AND (
        sr.requester_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.project_id = sr.project_id AND pm.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.projects p 
          WHERE p.id = sr.project_id AND p.admin_id = auth.uid()
        )
      )
    )
  );

-- Update support comment creation policy
DROP POLICY IF EXISTS "Users can create support comments" ON public.support_comments;
CREATE POLICY "Users can create support comments on accessible requests" ON public.support_comments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.support_requests sr
      WHERE sr.id = support_comments.support_request_id AND (
        sr.requester_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.project_id = sr.project_id AND pm.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.projects p 
          WHERE p.id = sr.project_id AND p.admin_id = auth.uid()
        )
      )
    )
  );
