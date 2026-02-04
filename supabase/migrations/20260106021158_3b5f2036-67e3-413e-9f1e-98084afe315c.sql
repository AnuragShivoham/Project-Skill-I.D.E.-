-- Add time_spent column to tasks table (in minutes)
ALTER TABLE public.tasks ADD COLUMN time_spent integer NOT NULL DEFAULT 0;