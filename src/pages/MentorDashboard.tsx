import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Terminal,
  LogOut,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Loader2,
  User,
  Target,
  Send,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  user_id: string | null;
  project_title: string;
  project_description: string;
  status: string;
  deadline: string;
  tech_stack: string[];
  skill_score: number;
  full_name: string;
  email: string;
  college: string;
  year_of_study: string;
  created_at: string;
}

interface Milestone {
  id: string;
  submission_id: string;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
  due_date: string | null;
  source: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  order_index: number;
  time_spent: number;
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  submission_id: string;
  student_id: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-success/20 text-success border-success/30",
  approved: "bg-success/20 text-success border-success/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  needs_changes: "bg-warning/20 text-warning border-warning/30",
  open: "bg-warning/20 text-warning border-warning/30",
  resolved: "bg-success/20 text-success border-success/30",
};

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  
  // Edit states
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  
  // Feedback dialog
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedbackSubmission, setFeedbackSubmission] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("progress_review");

  // Add Milestone dialog
  const [addMilestoneDialog, setAddMilestoneDialog] = useState(false);
  const [newMilestoneSubmissionId, setNewMilestoneSubmissionId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDescription, setNewMilestoneDescription] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // Add Task dialog
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      checkMentorRole();
    }
  }, [user, loading, navigate]);

  const checkMentorRole = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["mentor", "admin"]);
    
    if (error) {
      console.error("Error checking role:", error);
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (!data || data.length === 0) {
      toast({
        title: "Access Denied",
        description: "Mentor or Admin role required.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsMentor(true);
    fetchMentorData();
  };

  const fetchMentorData = async () => {
    try {
      // Fetch all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("project_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      // Fetch all milestones with tasks
      if (submissionsData && submissionsData.length > 0) {
        const submissionIds = submissionsData.map((s) => s.id);
        
        const { data: milestonesData, error: milestonesError } = await supabase
          .from("milestones")
          .select("*")
          .in("submission_id", submissionIds)
          .order("order_index", { ascending: true });

        if (milestonesError) throw milestonesError;

        if (milestonesData && milestonesData.length > 0) {
          const milestoneIds = milestonesData.map((m) => m.id);
          
          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .in("milestone_id", milestoneIds)
            .order("order_index", { ascending: true });

          if (tasksError) throw tasksError;

          // Group milestones by submission
          const grouped: Record<string, Milestone[]> = {};
          milestonesData.forEach((m) => {
            if (!grouped[m.submission_id]) {
              grouped[m.submission_id] = [];
            }
            grouped[m.submission_id].push({
              ...m,
              tasks: (tasksData || []).filter((t) => t.milestone_id === m.id),
            });
          });
          setMilestones(grouped);
        }
      }

      // Fetch help requests
      const { data: helpData, error: helpError } = await supabase
        .from("help_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (helpError) throw helpError;
      setHelpRequests(helpData || []);

    } catch (error) {
      console.error("Error fetching mentor data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("project_submissions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: `Project ${status}.` });
      fetchMentorData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const updateMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from("milestones")
        .update({
          title: editedTitle,
          description: editedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Milestone updated." });
      setEditingMilestone(null);
      fetchMentorData();
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast({ title: "Error", description: "Failed to update milestone.", variant: "destructive" });
    }
  };

  const updateMilestoneStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("milestones")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Milestone status updated." });
      fetchMentorData();
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase.from("milestones").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Milestone removed." });
      fetchMentorData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const submitFeedback = async () => {
    if (!feedbackSubmission || !feedbackText.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const { error } = await supabase.from("mentor_reviews").insert({
        submission_id: feedbackSubmission,
        reviewer_id: user!.id,
        review_type: feedbackType,
        feedback: feedbackText,
        status: "completed",
      });

      if (error) throw error;
      
      toast({ title: "Success", description: "Feedback submitted." });
      setFeedbackDialog(false);
      setFeedbackText("");
      setFeedbackSubmission(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const resolveHelpRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("help_requests")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Help request resolved." });
      fetchMentorData();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const addNewMilestone = async () => {
    if (!newMilestoneSubmissionId || !newMilestoneTitle.trim()) return;

    setSubmittingMilestone(true);
    try {
      // Get max order_index for this submission
      const existingMilestones = milestones[newMilestoneSubmissionId] || [];
      const maxOrder = existingMilestones.length > 0 
        ? Math.max(...existingMilestones.map((m) => m.order_index)) 
        : -1;

      const { error } = await supabase.from("milestones").insert({
        submission_id: newMilestoneSubmissionId,
        title: newMilestoneTitle,
        description: newMilestoneDescription || null,
        due_date: newMilestoneDueDate || null,
        source: "mentor",
        status: "pending",
        order_index: maxOrder + 1,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Milestone added." });
      setAddMilestoneDialog(false);
      setNewMilestoneTitle("");
      setNewMilestoneDescription("");
      setNewMilestoneDueDate("");
      setNewMilestoneSubmissionId(null);
      fetchMentorData();
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast({ title: "Error", description: "Failed to add milestone.", variant: "destructive" });
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const addNewTask = async () => {
    if (!newTaskMilestoneId || !newTaskTitle.trim()) return;

    setSubmittingTask(true);
    try {
      // Get existing tasks for this milestone to determine order
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("order_index")
        .eq("milestone_id", newTaskMilestoneId);

      const maxOrder = existingTasks && existingTasks.length > 0
        ? Math.max(...existingTasks.map((t) => t.order_index))
        : -1;

      const { error } = await supabase.from("tasks").insert({
        milestone_id: newTaskMilestoneId,
        title: newTaskTitle,
        description: newTaskDescription || null,
        status: "pending",
        progress: 0,
        time_spent: 0,
        order_index: maxOrder + 1,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Task added." });
      setAddTaskDialog(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskMilestoneId(null);
      fetchMentorData();
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    } finally {
      setSubmittingTask(false);
    }
  };

  const openAddMilestoneDialog = (submissionId: string) => {
    setNewMilestoneSubmissionId(submissionId);
    setAddMilestoneDialog(true);
  };

  const openAddTaskDialog = (milestoneId: string) => {
    setNewTaskMilestoneId(milestoneId);
    setAddTaskDialog(true);
  };

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditedTitle(milestone.title);
    setEditedDescription(milestone.description || "");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getSubmissionProgress = (submissionId: string) => {
    const subMilestones = milestones[submissionId] || [];
    if (subMilestones.length === 0) return 0;
    const completed = subMilestones.filter((m) => m.status === "completed" || m.status === "approved").length;
    return Math.round((completed / subMilestones.length) * 100);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isMentor) {
    return null;
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const activeSubmissions = submissions.filter((s) => s.status === "in_progress" || s.status === "approved");
  const openHelpRequests = helpRequests.filter((h) => h.status === "open");

  return (
    <>
      <Helmet>
        <title>Mentor Dashboard | AMIT–BODHIT</title>
        <meta name="description" content="Review submissions, manage milestones, and provide feedback to students." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">AMIT–BODHIT</span>
                <span className="text-xs text-accent font-mono">mentor portal</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Pending Review</span>
              </div>
              <span className="text-2xl font-bold text-warning">{pendingSubmissions.length}</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Active Projects</span>
              </div>
              <span className="text-2xl font-bold text-primary">{activeSubmissions.length}</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Help Requests</span>
              </div>
              <span className="text-2xl font-bold text-accent">{openHelpRequests.length}</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Total Students</span>
              </div>
              <span className="text-2xl font-bold">{submissions.length}</span>
            </div>
          </div>

          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="help">Help Requests</TabsTrigger>
            </TabsList>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Pending Submissions
              </h2>
              
              {pendingSubmissions.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending submissions to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((sub) => (
                    <div key={sub.id} className="bg-card border border-border rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{sub.project_title}</h3>
                          <p className="text-sm text-muted-foreground">{sub.full_name} • {sub.email}</p>
                          <p className="text-xs text-muted-foreground">{sub.college} • {sub.year_of_study}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[sub.status]}>{sub.status}</Badge>
                          <Badge variant="outline">Score: {sub.skill_score}/15</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{sub.project_description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sub.tech_stack.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Deadline: {new Date(sub.deadline).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSubmissionStatus(sub.id, "rejected")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateSubmissionStatus(sub.id, "approved")}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Active Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Active Projects
              </h2>

              {activeSubmissions.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active projects.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubmissions.map((sub) => (
                    <div key={sub.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <button
                        className="w-full p-6 text-left hover:bg-secondary/30 transition-colors"
                        onClick={() => setSelectedSubmission(selectedSubmission === sub.id ? null : sub.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedSubmission === sub.id ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-semibold">{sub.project_title}</h3>
                              <p className="text-sm text-muted-foreground">{sub.full_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{getSubmissionProgress(sub.id)}%</div>
                              <Progress value={getSubmissionProgress(sub.id)} className="w-24 h-2" />
                            </div>
                            <Badge className={statusColors[sub.status]}>{sub.status}</Badge>
                          </div>
                        </div>
                      </button>

                      {selectedSubmission === sub.id && (
                        <div className="border-t border-border p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Milestones</h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openAddMilestoneDialog(sub.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Milestone
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFeedbackSubmission(sub.id);
                                  setFeedbackDialog(true);
                                }}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Feedback
                              </Button>
                            </div>
                          </div>

                          {(milestones[sub.id] || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No milestones yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {(milestones[sub.id] || []).map((m) => (
                                <div key={m.id} className="border border-border rounded-lg overflow-hidden">
                                  <div className="p-4 bg-secondary/20">
                                    {editingMilestone === m.id ? (
                                      <div className="space-y-3">
                                        <Input
                                          value={editedTitle}
                                          onChange={(e) => setEditedTitle(e.target.value)}
                                          placeholder="Milestone title"
                                        />
                                        <Textarea
                                          value={editedDescription}
                                          onChange={(e) => setEditedDescription(e.target.value)}
                                          placeholder="Description"
                                          rows={2}
                                        />
                                        <div className="flex gap-2">
                                          <Button size="sm" onClick={() => updateMilestone(m.id)}>
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingMilestone(null)}
                                          >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-start justify-between">
                                        <button
                                          className="flex items-center gap-2 text-left"
                                          onClick={() => toggleMilestone(m.id)}
                                        >
                                          {expandedMilestones.has(m.id) ? (
                                            <ChevronDown className="w-4 h-4" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4" />
                                          )}
                                          <div>
                                            <div className="font-medium">{m.title}</div>
                                            {m.description && (
                                              <div className="text-sm text-muted-foreground">{m.description}</div>
                                            )}
                                          </div>
                                        </button>
                                        <div className="flex items-center gap-2">
                                          <Select
                                            value={m.status}
                                            onValueChange={(val) => updateMilestoneStatus(m.id, val)}
                                          >
                                            <SelectTrigger className="w-32 h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">Pending</SelectItem>
                                              <SelectItem value="in_progress">In Progress</SelectItem>
                                              <SelectItem value="completed">Completed</SelectItem>
                                              <SelectItem value="approved">Approved</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Button size="icon" variant="ghost" onClick={() => startEditMilestone(m)}>
                                            <Edit3 className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() => deleteMilestone(m.id)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {expandedMilestones.has(m.id) && (
                                    <div className="p-4 space-y-2 bg-background">
                                      {m.tasks.map((task) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center justify-between p-3 border border-border rounded-md"
                                        >
                                          <div className="flex-1">
                                            <div className="text-sm font-medium">{task.title}</div>
                                            {task.description && (
                                              <div className="text-xs text-muted-foreground">{task.description}</div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="text-xs text-muted-foreground">
                                              {task.time_spent > 0 && `${Math.floor(task.time_spent / 60)}h ${task.time_spent % 60}m`}
                                            </div>
                                            <Progress value={task.progress} className="w-16 h-2" />
                                            <Badge className={cn("text-xs", statusColors[task.status])}>
                                              {task.progress}%
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full mt-2 border-dashed border border-border"
                                        onClick={() => openAddTaskDialog(m.id)}
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Task
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Help Requests Tab */}
            <TabsContent value="help" className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Help Requests
              </h2>

              {helpRequests.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No help requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((req) => (
                    <div key={req.id} className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{req.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={statusColors[req.status]}>{req.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{req.description}</p>
                      {req.status === "open" && (
                        <Button size="sm" onClick={() => resolveHelpRequest(req.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Provide constructive feedback to help the student progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress_review">Progress Review</SelectItem>
                <SelectItem value="milestone_review">Milestone Review</SelectItem>
                <SelectItem value="code_review">Code Review</SelectItem>
                <SelectItem value="general_feedback">General Feedback</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={submittingFeedback || !feedbackText.trim()}>
              {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={addMilestoneDialog} onOpenChange={setAddMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="e.g., Set up project infrastructure"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what this milestone covers..."
                value={newMilestoneDescription}
                onChange={(e) => setNewMilestoneDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Due Date</label>
              <Input
                type="date"
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMilestoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewMilestone} disabled={submittingMilestone || !newMilestoneTitle.trim()}>
              {submittingMilestone ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialog} onOpenChange={setAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                placeholder="e.g., Implement user authentication"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what needs to be done..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewTask} disabled={submittingTask || !newTaskTitle.trim()}>
              {submittingTask ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MentorDashboard;
