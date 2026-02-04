-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'student');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  due_date DATE,
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'mentor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_reviews table
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('submission', 'checkpoint', 'code', 'help_request')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_requests table for student-initiated reviews
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add user_id to project_submissions to link with authenticated users
ALTER TABLE public.project_submissions ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Milestones policies
CREATE POLICY "Students can view own milestones"
ON public.milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can view all milestones"
ON public.milestones FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can manage milestones"
ON public.milestones FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can propose milestones"
ON public.milestones FOR INSERT
WITH CHECK (
  source = 'student' AND EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  )
);

-- Tasks policies
CREATE POLICY "Students can view own tasks"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can view all tasks"
ON public.tasks FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can manage tasks"
ON public.tasks FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can update own task progress"
ON public.tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

-- Mentor reviews policies
CREATE POLICY "Students can view own reviews"
ON public.mentor_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_submissions ps
    WHERE ps.id = submission_id AND ps.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.milestones m
    JOIN public.project_submissions ps ON ps.id = m.submission_id
    WHERE m.id = milestone_id AND ps.user_id = auth.uid()
  )
);

CREATE POLICY "Mentors can manage reviews"
ON public.mentor_reviews FOR ALL
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- Help requests policies
CREATE POLICY "Students can view own help requests"
ON public.help_requests FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create help requests"
ON public.help_requests FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Mentors can view all help requests"
ON public.help_requests FOR SELECT
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Mentors can update help requests"
ON public.help_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

-- Update project_submissions policies to use user_id
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Anyone can submit projects" ON public.project_submissions;

CREATE POLICY "Users can view own submissions"
ON public.project_submissions FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'mentor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can submit projects"
ON public.project_submissions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own submissions"
ON public.project_submissions FOR UPDATE
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_reviews_updated_at
BEFORE UPDATE ON public.mentor_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON public.help_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();