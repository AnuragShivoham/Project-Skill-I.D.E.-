import { supabase } from "@/integrations/supabase/client";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "explanation" | "hint" | "question" | "warning";
  createdAt?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  submissionId?: string | null;
  title: string;
  projectIdea?: string;
  techStack?: string;
  skillLevel?: string;
  timeline?: string;
  intakeConfirmed: boolean;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  lastMessageAt?: number;
}

/**
 * Load all conversations for the current user from Supabase
 */
export async function loadUserConversations(): Promise<Conversation[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return [];
    }

    return (data || []).map((conv: any) => ({
      id: conv.id,
      userId: conv.user_id,
      submissionId: conv.submission_id || null,
      title: conv.title,
      projectIdea: conv.project_idea,
      techStack: conv.tech_stack,
      skillLevel: conv.skill_level,
      timeline: conv.timeline,
      intakeConfirmed: conv.intake_confirmed,
      messages: (conv.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        type: msg.message_type,
        createdAt: new Date(msg.created_at).getTime(),
      })),
      createdAt: new Date(conv.created_at).getTime(),
      updatedAt: new Date(conv.updated_at).getTime(),
      lastMessageAt: conv.last_message_at ? new Date(conv.last_message_at).getTime() : undefined,
    }));
  } catch (err) {
    console.error("Failed to load conversations:", err);
    return [];
  }
}

/**
 * Load a single conversation by ID from Supabase
 */
export async function loadConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("id", conversationId)
      .single();

    if (error || !data) {
      console.error("Error loading conversation:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      submissionId: data.submission_id || null,
      title: data.title,
      projectIdea: data.project_idea,
      techStack: data.tech_stack,
      skillLevel: data.skill_level,
      timeline: data.timeline,
      intakeConfirmed: data.intake_confirmed,
      messages: (data.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        type: msg.message_type,
        createdAt: new Date(msg.created_at).getTime(),
      })),
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      lastMessageAt: data.last_message_at ? new Date(data.last_message_at).getTime() : undefined,
    };
  } catch (err) {
    console.error("Failed to load conversation:", err);
    return null;
  }
}

/**
 * Create a new conversation in Supabase
 */
export async function createConversation(
  title: string,
  submissionId?: string | null,
  intake?: {
    projectIdea: string;
    techStack: string;
    skillLevel: string;
    timeline: string;
  }
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        submission_id: submissionId || null,
        title,
        project_idea: intake?.projectIdea,
        tech_stack: intake?.techStack,
        skill_level: intake?.skillLevel,
        timeline: intake?.timeline,
        intake_confirmed: !!intake,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error("Failed to create conversation:", err);
    return null;
  }
}

/**
 * Add a message to a conversation in Supabase
 */
export async function addMessageToConversation(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  messageType?: "explanation" | "hint" | "question" | "warning",
  fileOps?: any,
  mentorReport?: any
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        message_type: messageType || "explanation",
        file_ops: fileOps || null,
        mentor_report: mentorReport || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error adding message:", error);
      return null;
    }

    // Update conversation's updated_at and last_message_at
    await supabase
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return data.id;
  } catch (err) {
    console.error("Failed to add message:", err);
    return null;
  }
}

/**
 * Update conversation intake confirmation and details
 */
export async function updateConversationIntake(
  conversationId: string,
  intake: {
    projectIdea: string;
    techStack: string;
    skillLevel: string;
    timeline: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        project_idea: intake.projectIdea,
        tech_stack: intake.techStack,
        skill_level: intake.skillLevel,
        timeline: intake.timeline,
        intake_confirmed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation intake:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to update conversation intake:", err);
    return false;
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation title:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to update conversation title:", err);
    return false;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("conversations").delete().eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to delete conversation:", err);
    return false;
  }
}
