import { useState } from "react";
import { Check, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  order_index: number;
  time_spent: number;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success border-success/30",
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(task.progress);
  const [timeInput, setTimeInput] = useState("");
  const [showTimeInput, setShowTimeInput] = useState(false);

  const updateTask = async (updates: { progress?: number; status?: string; time_spent?: number }) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };

  const handleProgressCommit = () => {
    if (progress !== task.progress) {
      const newStatus = progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending";
      updateTask({ progress, status: newStatus });
    }
  };

  const handleMarkComplete = () => {
    const newProgress = task.status === "completed" ? 0 : 100;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setProgress(newProgress);
    updateTask({ progress: newProgress, status: newStatus });
  };

  const handleAddTime = () => {
    const minutes = parseInt(timeInput, 10);
    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Invalid time",
        description: "Please enter a valid number of minutes.",
        variant: "destructive",
      });
      return;
    }
    updateTask({ time_spent: task.time_spent + minutes });
    setTimeInput("");
    setShowTimeInput(false);
    toast({
      title: "Time logged",
      description: `Added ${formatTime(minutes)} to task.`,
    });
  };

  return (
    <div className="bg-background/50 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{task.title}</span>
            {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs shrink-0", statusColors[task.status])}
        >
          {task.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Progress Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Slider
          value={[progress]}
          onValueChange={handleProgressChange}
          onValueCommit={handleProgressCommit}
          max={100}
          step={5}
          className="cursor-pointer"
          disabled={isUpdating}
        />
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <Button
            variant={task.status === "completed" ? "default" : "outline"}
            size="sm"
            onClick={handleMarkComplete}
            disabled={isUpdating}
            className="h-7 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            {task.status === "completed" ? "Completed" : "Mark Complete"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {showTimeInput ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="min"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="h-7 w-16 text-xs"
                min={1}
              />
              <Button size="sm" className="h-7 text-xs" onClick={handleAddTime} disabled={isUpdating}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowTimeInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeInput(true)}
              className="h-7 text-xs text-muted-foreground"
            >
              <Clock className="w-3 h-3 mr-1" />
              {task.time_spent > 0 ? formatTime(task.time_spent) : "Log time"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
