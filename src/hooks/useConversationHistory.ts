import { useState, useEffect, useCallback } from "react";
import {
  Conversation,
  ConversationMessage,
  loadUserConversations,
  loadConversationById,
  createConversation,
  addMessageToConversation,
  updateConversationIntake,
  updateConversationTitle,
  deleteConversation,
} from "@/services/ConversationService";

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load all conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    const convs = await loadUserConversations();
    setConversations(convs);
    setIsLoading(false);
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    const conv = await loadConversationById(conversationId);
    if (conv) {
      setCurrentConversation(conv);
    }
    setIsLoading(false);
  }, []);

  const startNewConversation = useCallback(
    async (
      title: string = "New Conversation",
      submissionId?: string | null,
      intake?: {
        projectIdea: string;
        techStack: string;
        skillLevel: string;
        timeline: string;
      }
    ) => {
      const conversationId = await createConversation(title, submissionId, intake);
      if (conversationId) {
        await loadConversations();
        await loadConversation(conversationId);
        return conversationId;
      }
      return null;
    },
    [loadConversations, loadConversation]
  );

  const addMessage = useCallback(
    async (
      role: "user" | "assistant",
      content: string,
      messageType?: "explanation" | "hint" | "question" | "warning",
      fileOps?: any,
      mentorReport?: any
    ) => {
      if (!currentConversation) {
        console.error("No current conversation");
        return;
      }

      const messageId = await addMessageToConversation(
        currentConversation.id,
        role,
        content,
        messageType,
        fileOps,
        mentorReport
      );

      if (messageId) {
        const newMessage: ConversationMessage = {
          id: messageId,
          role,
          content,
          type: messageType,
          createdAt: Date.now(),
        };

        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMessage],
                updatedAt: Date.now(),
              }
            : null
        );

        // Update conversation in list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation.id
              ? { ...conv, messages: [...conv.messages, newMessage], updatedAt: Date.now() }
              : conv
          )
        );
      }
    },
    [currentConversation]
  );

  const saveIntake = useCallback(
    async (intake: {
      projectIdea: string;
      techStack: string;
      skillLevel: string;
      timeline: string;
    }) => {
      if (!currentConversation) return;

      const success = await updateConversationIntake(currentConversation.id, intake);
      if (success) {
        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                ...intake,
                intakeConfirmed: true,
              }
            : null
        );
      }
    },
    [currentConversation]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      if (!currentConversation) return;

      const success = await updateConversationTitle(currentConversation.id, title);
      if (success) {
        setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
        setConversations((prev) =>
          prev.map((conv) => (conv.id === currentConversation.id ? { ...conv, title } : conv))
        );
      }
    },
    [currentConversation]
  );

  const removeConversation = useCallback(
    async (conversationId: string) => {
      const success = await deleteConversation(conversationId);
      if (success) {
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      }
    },
    [currentConversation]
  );

  return {
    conversations,
    currentConversation,
    isLoading,
    loadConversations,
    loadConversation,
    startNewConversation,
    addMessage,
    saveIntake,
    updateTitle,
    removeConversation,
  };
};
