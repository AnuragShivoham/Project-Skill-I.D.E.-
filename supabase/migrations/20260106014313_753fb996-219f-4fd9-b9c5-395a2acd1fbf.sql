-- Allow both authenticated and unauthenticated users to submit projects
DROP POLICY IF EXISTS "Authenticated users can submit projects" ON public.project_submissions;

CREATE POLICY "Anyone can submit projects"
ON public.project_submissions FOR INSERT
WITH CHECK (true);

-- Also allow unauthenticated users to view their submission via email (for backwards compat)
DROP POLICY IF EXISTS "Users can view own submissions" ON public.project_submissions;

CREATE POLICY "Users can view own submissions"
ON public.project_submissions FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'mentor') 
  OR public.has_role(auth.uid(), 'admin')
  OR user_id IS NULL
);