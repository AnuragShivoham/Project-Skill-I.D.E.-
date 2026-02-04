-- Create conversations table to store chat sessions
-- Each conversation represents a unique chat session between user and BODHIT chatbot
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.project_submissions(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled Conversation',
  project_idea text,
  tech_stack text,
  skill_level text,
  timeline text,
  intake_confirmed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

-- Create index on submission_id
CREATE INDEX IF NOT EXISTS idx_conversations_submission_id ON public.conversations(submission_id);

-- Create index on updated_at for sorting (most recent first)
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Create messages table to store individual messages in a conversation
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  message_type text DEFAULT 'explanation' CHECK (message_type IN ('explanation', 'hint', 'question', 'warning')),
  file_ops jsonb, -- Store parsed FILE_OPS if present
  mentor_report jsonb, -- Store parsed MENTOR_REPORT if present
  created_at timestamp with time zone DEFAULT now()
);

-- Create index on conversation_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations" ON public.conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Mentors and admins can view all conversations
CREATE POLICY "Mentors and admins view all conversations" ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );

-- Messages Policies
-- Policy: Users can view messages in their own conversations
CREATE POLICY "Users can view own conversation messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages in their own conversations
CREATE POLICY "Users can insert messages in own conversations" ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- Policy: Mentors and admins can view all messages
CREATE POLICY "Mentors and admins view all messages" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('mentor', 'admin')
    )
  );
