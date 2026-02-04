import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Terminal,
  LogOut,
  FileText,
  Target,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  HelpCircle,
  User,
  Loader2,
  Sparkles,
  Wand2,
  BookOpen,
  Code,
  GraduationCap,
  PlayCircle,
  ExternalLink,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TaskCard } from "@/components/TaskCard";
import FloatingAIChat from "@/components/FloatingAIChat";

interface Submission {
  id: string;
  project_title: string;
  project_description: string;
  status: string;
  deadline: string;
  tech_stack: string[];
  skill_score: number;
  created_at: string;
}

interface Milestone {
  id: string;
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

interface Review {
  id: string;
  review_type: string;
  status: string;
  feedback: string | null;
  created_at: string;
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
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

const learningResources = [
  {
    id: 1,
    title: "Getting Started with AMIT-BODHIT",
    description: "Learn how to submit your first project and navigate the platform.",
    icon: PlayCircle,
    type: "Video",
    duration: "5 min",
  },
  {
    id: 2,
    title: "How to Write Good Project Descriptions",
    description: "Tips for describing your project to get better AI-generated milestones.",
    icon: BookOpen,
    type: "Guide",
    duration: "3 min read",
  },
  {
    id: 3,
    title: "Understanding Your Roadmap",
    description: "Learn how to interpret and follow your personalized learning path.",
    icon: Target,
    type: "Tutorial",
    duration: "8 min",
  },
  {
    id: 4,
    title: "Effective Task Management",
    description: "Best practices for tracking progress and completing tasks efficiently.",
    icon: CheckCircle2,
    type: "Guide",
    duration: "4 min read",
  },
  {
    id: 5,
    title: "Working with Your Mentor",
    description: "How to communicate effectively and get the most from mentor feedback.",
    icon: GraduationCap,
    type: "Guide",
    duration: "5 min read",
  },
  {
    id: 6,
    title: "Code Quality Essentials",
    description: "Learn coding standards and best practices for real-world development.",
    icon: Code,
    type: "Tutorial",
    duration: "15 min",
  },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [generatingMilestones, setGeneratingMilestones] = useState(false);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());

  // Help Request Dialog
  const [helpDialog, setHelpDialog] = useState(false);
  const [helpTitle, setHelpTitle] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [submittingHelp, setSubmittingHelp] = useState(false);
  // Mentor report UI
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [mentorReports, setMentorReports] = useState<any[]>([]);
  const [loadingMentorReports, setLoadingMentorReports] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // fetch profile role for mentor UI
      (async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();
          if (!error && data) setProfileRole(data.role || null);
        } catch (err) {
          console.warn("Failed to fetch profile role:", err);
        }
      })();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("project_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      if (submissionsData && submissionsData.length > 0) {
        const submissionIds = submissionsData.map((s) => s.id);

        // Fetch milestones with tasks
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

          const milestonesWithTasks = milestonesData.map((m) => ({
            ...m,
            tasks: (tasksData || []).filter((t) => t.milestone_id === m.id),
          }));

          setMilestones(milestonesWithTasks);
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("mentor_reviews")
          .select("*")
          .in("submission_id", submissionIds)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // Fetch help requests
        const { data: helpData, error: helpError } = await supabase
          .from("help_requests")
          .select("*")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (helpError) throw helpError;
        setHelpRequests(helpData || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const calculateOverallProgress = () => {
    if (milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(
      (m) => m.status === "completed" || m.status === "approved"
    ).length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  const calculateTotalTimeSpent = () => {
    let total = 0;
    milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        total += t.time_spent;
      });
    });
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const generateMilestones = async () => {
    if (!currentSubmission) return;

    setGeneratingMilestones(true);
    toast({
      title: "Generating Roadmap",
      description: "AI is analyzing your project and creating milestones...",
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-milestones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ submissionId: currentSubmission.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have run out. Please add credits to continue.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to generate milestones");
        }
        return;
      }

      toast({
        title: "Roadmap Generated!",
        description: `Created ${data.milestonesCreated} milestones with tasks for your project.`,
      });

      await fetchDashboardData();
    } catch (error) {
      console.error("Milestone generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setGeneratingMilestones(false);
    }
  };

  const submitHelpRequest = async () => {
    if (!currentSubmission || !helpTitle.trim() || !helpDescription.trim()) return;

    setSubmittingHelp(true);
    try {
      const { error } = await supabase.from("help_requests").insert({
        student_id: user!.id,
        submission_id: currentSubmission.id,
        title: helpTitle,
        description: helpDescription,
        status: "open",
      });

      if (error) throw error;

      toast({ title: "Success", description: "Help request submitted." });
      setHelpDialog(false);
      setHelpTitle("");
      setHelpDescription("");
      fetchDashboardData();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    } finally {
      setSubmittingHelp(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSubmission = submissions[0];
  const overallProgress = calculateOverallProgress();

  return (
    <>
      <Helmet>
        <title>Student Dashboard | AMIT–BODHIT</title>
        <meta name="description" content="Track your project progress, learn new skills, and get mentor guidance." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">AMIT–BODHIT</span>
                <span className="text-xs text-muted-foreground font-mono">student portal</span>
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
          <Tabs defaultValue="project" className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-4">
              <TabsTrigger value="project">My Project</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            {/* Project Tab */}
            <TabsContent value="project" className="space-y-6">
              {!currentSubmission ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Projects Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Submit your first project to get started with AMIT–BODHIT.
                  </p>
                  <Button asChild>
                    <Link to="/submit-project">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit a Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Project Overview */}
                  <section className="bg-card border border-border rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">{currentSubmission.project_title}</h1>
                        <p className="text-muted-foreground line-clamp-2">
                          {currentSubmission.project_description}
                        </p>
                      </div>
                      <Badge className={cn("shrink-0", statusColors[currentSubmission.status])}>
                        {currentSubmission.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Deadline</div>
                        <div className="font-semibold">
                          {new Date(currentSubmission.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Skill Score</div>
                        <div className="font-semibold">{currentSubmission.skill_score}/15</div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Time Spent</div>
                        <div className="font-semibold">{calculateTotalTimeSpent()}</div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Milestones</div>
                        <div className="font-semibold">{milestones.length}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentSubmission.tech_stack.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  {/* Overall Progress */}
                  <section className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Overall Progress
                      </h2>
                      <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                  </section>

                  {/* Milestones & Tasks */}
                  <section className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Milestones & Tasks
                      </h2>
                    </div>

                    {milestones.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                        <h3 className="font-medium mb-2">No Milestones Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Generate an AI-powered learning roadmap based on your project.
                        </p>
                        <Button onClick={generateMilestones} disabled={generatingMilestones} className="gap-2">
                          {generatingMilestones ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating Roadmap...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4" />
                              Generate AI Roadmap
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {milestones.map((milestone) => (
                          <div key={milestone.id} className="border border-border rounded-lg overflow-hidden">
                            <button
                              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
                              onClick={() => toggleMilestone(milestone.id)}
                            >
                              <div className="flex items-center gap-3">
                                {expandedMilestones.has(milestone.id) ? (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                                <div>
                                  <div className="font-medium">{milestone.title}</div>
                                  {milestone.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {milestone.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {milestone.source}
                                </Badge>
                                <Badge className={cn("text-xs", statusColors[milestone.status])}>
                                  {milestone.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </button>

                            {expandedMilestones.has(milestone.id) && milestone.tasks.length > 0 && (
                              <div className="border-t border-border bg-secondary/20 p-4 space-y-3">
                                {milestone.tasks.map((task) => (
                                  <TaskCard key={task.id} task={task} onUpdate={fetchDashboardData} />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </TabsContent>

            {/* Learn Tab */}
            <TabsContent value="learn" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Learning Resources
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <resource.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{resource.duration}</span>
                        </div>
                        <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link to="/submit-project">
                      <Plus className="w-5 h-5" />
                      <span>Submit New Project</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link to="/ide">
                      <Code className="w-5 h-5" />
                      <span>Open IDE</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setHelpDialog(true)}
                    disabled={!currentSubmission}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Request Help</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>View Docs</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Mentor Reviews
              </h2>

              {reviews.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet. Complete milestones to receive feedback.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {review.review_type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.feedback && (
                        <p className="text-sm text-foreground">{review.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Help Tab */}
            <TabsContent value="help" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Help Requests
                </h2>
                <Button onClick={() => setHelpDialog(true)} disabled={!currentSubmission}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </div>

              {helpRequests.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No help requests yet. Need assistance? Create a request!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {helpRequests.map((req) => (
                    <div key={req.id} className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{req.title}</h3>
                        <Badge className={statusColors[req.status]}>{req.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Floating AI Chat */}
        {/* Mentor reports button (mentors/admins only) */}
        {profileRole && (profileRole === "mentor" || profileRole === "admin") && (
          <div className="fixed bottom-24 right-6 z-50">
            <Button onClick={async () => { setMentorDialogOpen(true); setLoadingMentorReports(true); try {
                const { data } = await supabase.from("mentor_reports").select("*").order("created_at", { ascending: false });
                setMentorReports(data || []);
              } catch (err) {
                console.error(err);
              } finally { setLoadingMentorReports(false); }
            }}>
              View Mentor Reports
            </Button>
          </div>
        )}

        <FloatingAIChat 
          currentTask={milestones.length > 0 && milestones[0]?.tasks?.length > 0 
            ? milestones[0].tasks.find(t => t.status !== 'completed')?.title 
            : undefined}
          submissionId={currentSubmission?.id}
        />
      </div>

      {/* Help Request Dialog */}
      <Dialog open={helpDialog} onOpenChange={setHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Help</DialogTitle>
            <DialogDescription>
              Describe what you need help with and a mentor will respond.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Brief title for your request"
              value={helpTitle}
              onChange={(e) => setHelpTitle(e.target.value)}
            />
            <Textarea
              placeholder="Describe your issue in detail..."
              value={helpDescription}
              onChange={(e) => setHelpDescription(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHelpDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitHelpRequest}
              disabled={submittingHelp || !helpTitle.trim() || !helpDescription.trim()}
            >
              {submittingHelp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Mentor Reports Dialog (mentors/admins) */}
          <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mentor Reports</DialogTitle>
                <DialogDescription>Reports generated by the Project-Skill Chatbot.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
                {loadingMentorReports ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : mentorReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No mentor reports found.</p>
                ) : (
                  mentorReports.map((r) => (
                    <div key={r.id} className="bg-card border border-border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">Submission: {r.submission_id}</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-2 rounded">{JSON.stringify(r.report, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMentorDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </>
  );
};

export default StudentDashboard;
