-- Create mentor_reports table to store chatbot-generated feedback
-- This table links milestone/project reviews to specific submissions and stores the JSON report

CREATE TABLE IF NOT EXISTS public.mentor_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  report jsonb NOT NULL,
  raw_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on submission_id for faster queries
CREATE INDEX IF NOT EXISTS idx_mentor_reports_submission_id ON public.mentor_reports(submission_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_mentor_reports_created_at ON public.mentor_reports(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to insert (for chatbot function)
CREATE POLICY "Allow insert for chatbot" ON public.mentor_reports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Mentors and admins can view all reports
CREATE POLICY "Mentors and admins can view all" ON public.mentor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );

-- Policy: Students can view reports for their own submissions
CREATE POLICY "Students view own reports" ON public.mentor_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_submissions
      WHERE id = mentor_reports.submission_id
        AND user_id = auth.uid()
    )
  );
