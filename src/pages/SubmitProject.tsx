import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  college: z.string().min(2, "College name is required").max(200),
  yearOfStudy: z.string().min(1, "Select your year of study"),
});

const projectInfoSchema = z.object({
  projectTitle: z.string().min(5, "Title must be at least 5 characters").max(150),
  projectDescription: z.string().min(50, "Description must be at least 50 characters").max(2000),
  techStack: z.array(z.string()).min(1, "Select at least one technology"),
  deadline: z.date({ required_error: "Deadline is required" }),
});

const skillQuestions = [
  {
    id: "q1",
    question: "How would you describe your programming experience?",
    options: [
      { value: "0", label: "Complete beginner - never written code" },
      { value: "1", label: "Beginner - completed a few tutorials" },
      { value: "2", label: "Intermediate - built small projects" },
      { value: "3", label: "Advanced - built multiple full applications" },
    ],
  },
  {
    id: "q2",
    question: "Have you worked with version control (Git)?",
    options: [
      { value: "0", label: "Never used it" },
      { value: "1", label: "Know the basics (commit, push, pull)" },
      { value: "2", label: "Comfortable with branching and merging" },
      { value: "3", label: "Advanced (rebasing, resolving conflicts, CI/CD)" },
    ],
  },
  {
    id: "q3",
    question: "How do you typically approach debugging?",
    options: [
      { value: "0", label: "I get stuck and give up" },
      { value: "1", label: "I search for similar code to copy" },
      { value: "2", label: "I read error messages and use console.log" },
      { value: "3", label: "I systematically isolate the issue and fix it" },
    ],
  },
  {
    id: "q4",
    question: "What's your experience with reading documentation?",
    options: [
      { value: "0", label: "I prefer video tutorials only" },
      { value: "1", label: "I can follow along but struggle" },
      { value: "2", label: "I regularly read docs to learn new things" },
      { value: "3", label: "I can quickly navigate and understand any docs" },
    ],
  },
  {
    id: "q5",
    question: "Why do you want to use AMIT–BODHIT?",
    options: [
      { value: "0", label: "I just need someone to build my project" },
      { value: "1", label: "I want help completing my project faster" },
      { value: "2", label: "I want to learn while building something real" },
      { value: "3", label: "I want to master skills through hands-on guidance" },
    ],
  },
];

const techOptions = [
  "React", "Node.js", "Python", "Java", "TypeScript", "JavaScript",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Docker",
  "Next.js", "Express", "Django", "Flask", "Spring Boot", "GraphQL",
];

type Step = "personal" | "project" | "quiz" | "success";

const SubmitProject = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      college: "",
      yearOfStudy: "",
    },
  });

  const projectForm = useForm<z.infer<typeof projectInfoSchema>>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      projectTitle: "",
      projectDescription: "",
      techStack: [],
      deadline: undefined,
    },
  });

  const handlePersonalSubmit = () => {
    setStep("project");
  };

  const handleProjectSubmit = () => {
    setStep("quiz");
  };

  const calculateScore = (): number => {
    return Object.values(quizAnswers).reduce((sum, val) => sum + parseInt(val || "0"), 0);
  };

  const handleFinalSubmit = async () => {
    const allAnswered = skillQuestions.every((q) => quizAnswers[q.id]);
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const personalData = personalForm.getValues();
    const projectData = projectForm.getValues();
    const score = calculateScore();

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("project_submissions").insert({
        full_name: personalData.fullName,
        email: personalData.email,
        college: personalData.college,
        year_of_study: personalData.yearOfStudy,
        project_title: projectData.projectTitle,
        project_description: projectData.projectDescription,
        tech_stack: projectData.techStack,
        deadline: format(projectData.deadline, "yyyy-MM-dd"),
        skill_assessment: quizAnswers,
        skill_score: score,
        user_id: user?.id || null,
      });

      if (error) throw error;

      setStep("success");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Submit Your Project | AMIT–BODHIT</title>
        <meta
          name="description"
          content="Submit your project idea to AMIT–BODHIT and start your guided learning journey."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-12 px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Submit Your <span className="text-gradient">Project</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tell us about your project idea, and we'll create a personalized learning
              journey for you. No shortcuts — just real skill building.
            </p>
          </div>

          {/* Progress Indicator */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 mb-10">
              {["personal", "project", "quiz"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step === s
                        ? "bg-primary text-primary-foreground"
                        : ["personal", "project", "quiz"].indexOf(step) > i
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={cn(
                        "w-16 h-1 mx-2 rounded",
                        ["personal", "project", "quiz"].indexOf(step) > i
                          ? "bg-primary/50"
                          : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === "personal" && (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handlePersonalSubmit)} className="space-y-6">
                  <FormField
                    control={personalForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="college"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College / University</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your institution name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Study</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Post-Grad"].map(
                              (year) => (
                                <div key={year} className="flex items-center space-x-2">
                                  <RadioGroupItem value={year} id={year} />
                                  <Label htmlFor={year}>{year}</Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit">
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Step 2: Project Info */}
          {step === "project" && (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6">Project Details</h2>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-6">
                  <FormField
                    control={projectForm.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Attendance Management System" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={projectForm.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project idea, its features, and what you want to achieve..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={projectForm.control}
                    name="techStack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Tech Stack</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {techOptions.map((tech) => (
                              <div key={tech} className="flex items-center space-x-2">
                                <Checkbox
                                  id={tech}
                                  checked={field.value.includes(tech)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, tech]);
                                    } else {
                                      field.onChange(field.value.filter((t) => t !== tech));
                                    }
                                  }}
                                />
                                <Label htmlFor={tech} className="text-sm">
                                  {tech}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={projectForm.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Project Deadline</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : "Select deadline"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep("personal")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit">
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Skill Quiz */}
          {step === "quiz" && (
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 animate-fade-in">
              <h2 className="text-xl font-semibold mb-2">Skill Assessment</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Answer honestly — this helps us customize your learning journey. There are no
                wrong answers!
              </p>

              <div className="space-y-8">
                {skillQuestions.map((q, index) => (
                  <div key={q.id} className="space-y-4">
                    <p className="font-medium">
                      {index + 1}. {q.question}
                    </p>
                    <RadioGroup
                      value={quizAnswers[q.id] || ""}
                      onValueChange={(value) =>
                        setQuizAnswers((prev) => ({ ...prev, [q.id]: value }))
                      }
                      className="space-y-2"
                    >
                      {q.options.map((opt) => (
                        <div
                          key={opt.value}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                            quizAnswers[q.id] === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                          <Label
                            htmlFor={`${q.id}-${opt.value}`}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8 border-t border-border mt-8">
                <Button type="button" variant="outline" onClick={() => setStep("project")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                We've received your project submission. Our team will review your application
                and skill assessment. You'll hear from us within 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button onClick={() => navigate("/ide")}>
                  Explore the IDE
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SubmitProject;
