import { FileCode, GitCommit, BookOpen, UserCheck, ShieldAlert, Award, ArrowRight, Check, X } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileCode,
    title: "Submit Your Project",
    description: "Describe your project idea. We assess feasibility, complexity, and your current skill level.",
    detail: "Shortcut seekers get rejected. Learners get accepted.",
    status: "accepted",
  },
  {
    number: "02",
    icon: GitCommit,
    title: "Project Decomposition",
    description: "Your project is broken into milestones, tasks, and sub-tasks — each mapped to required concepts.",
    detail: "No skipping steps. No feature dumping.",
    status: "neutral",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Learn When Needed",
    description: "Content unlocks only when a task demands it. Short, contextual, directly applied.",
    detail: "No playlists. No generic courses.",
    status: "neutral",
  },
  {
    number: "04",
    icon: UserCheck,
    title: "Mentor Checkpoints",
    description: "Human mentors review your code at critical junctures. They critique, never fix.",
    detail: "Weak implementations get rejected.",
    status: "neutral",
  },
  {
    number: "05",
    icon: ShieldAlert,
    title: "Cheat Detection",
    description: "Copy-paste, AI over-reliance, and suspicious commits trigger locks and explain-your-code tests.",
    detail: "Fail? Start over.",
    status: "warning",
  },
  {
    number: "06",
    icon: Award,
    title: "Proof of Work",
    description: "Complete project, verified commit history, and the ability to explain your own code.",
    detail: "No certificate. Real skill.",
    status: "success",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary mb-4">
            THE PROCESS
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            How <span className="text-gradient">AMIT–BODHIT</span> Works
          </h2>
          <p className="text-muted-foreground">
            A ruthless, no-compromise journey from idea to fully-owned project.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="group relative rounded-xl border border-border bg-card/50 p-6 hover:bg-card transition-all duration-300 hover:border-primary/30"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                {/* Number and Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -left-2 text-xs font-mono text-muted-foreground bg-background px-1">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                    {step.title}
                    {step.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-success/10 text-success border border-success/30">
                        <Check className="w-3 h-3" /> ACCEPTED
                      </span>
                    )}
                    {step.status === "warning" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-warning/10 text-warning border border-warning/30">
                        <ShieldAlert className="w-3 h-3" /> ENFORCED
                      </span>
                    )}
                    {step.status === "success" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary border border-primary/30">
                        <Award className="w-3 h-3" /> EARNED
                      </span>
                    )}
                  </h3>
                  <p className="text-muted-foreground mb-2">{step.description}</p>
                  <p className="text-sm font-mono text-primary/80">{step.detail}</p>
                </div>

                {/* Arrow for flow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center text-muted-foreground/30">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-2xl mx-auto text-center mt-16 p-8 rounded-xl border border-primary/20 bg-primary/5">
          <h3 className="text-xl font-bold mb-2">Ready to Build For Real?</h3>
          <p className="text-muted-foreground mb-4">
            Submit your project idea and prove you're here to learn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Submit Project Idea
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
