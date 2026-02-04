import { useConversationHistory } from "@/hooks/useConversationHistory";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const ConversationHistory = () => {
  const { conversations, currentConversation, loadConversation, startNewConversation, removeConversation } =
    useConversationHistory();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleNewConversation = async () => {
    const conversationId = await startNewConversation();
    if (conversationId) {
      toast({
        title: "Success",
        description: "New conversation created",
      });
    }
  };

  const handleLoadConversation = (conversationId: string) => {
    loadConversation(conversationId);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting === conversationId) {
      // Confirm delete
      setIsDeleting(null);
      await removeConversation(conversationId);
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } else {
      // Show confirmation state
      setIsDeleting(conversationId);
      setTimeout(() => setIsDeleting(null), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Chat History</h2>
        <Button
          onClick={handleNewConversation}
          className="w-full"
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "p-3 cursor-pointer transition-colors hover:bg-muted",
                  currentConversation?.id === conversation.id && "bg-muted border-primary"
                )}
                onClick={() => handleLoadConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conversation.title}</p>
                    {conversation.projectIdea && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conversation.projectIdea}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.messages.length} messages
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "ml-auto",
                      isDeleting === conversation.id && "bg-destructive text-destructive-foreground"
                    )}
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
