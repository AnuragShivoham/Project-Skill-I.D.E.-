import { User, CheckCircle, XCircle, GitCommit, Code, MessageSquare, AlertTriangle, Award } from "lucide-react";

const timeline = [
  {
    step: 1,
    title: "Rohit contacts AMIT–BODHIT",
    description: "Submits: Attendance Management Web App. Deadline: 6 weeks.",
    detail: "Skill test: React basics ✓, Backend ✗",
    outcome: "Accepted — must learn backend + auth",
    status: "success",
  },
  {
    step: 2,
    title: "Project Decomposition",
    description: "System breaks project into 5 milestones with clear success criteria.",
    milestones: ["Auth System", "Database Schema", "Attendance API", "Frontend Dashboard", "Deployment"],
    status: "neutral",
  },
  {
    step: 3,
    title: "IDE Opens — Work Begins",
    description: "Rohit opens auth task. Blank logic file with boilerplate structure.",
    aiInteraction: {
      ai: "JWT kya hota hai, kyu chahiye — samjhaun?",
      note: "AI explains, never codes",
    },
    status: "neutral",
  },
  {
    step: 4,
    title: "Mentor Checkpoint",
    description: "Auth complete → mentor reviews code",
    mentorFeedback: "Password hashing galat hai, dobara karo.",
    outcome: "Fail → step locked. Fix → approved.",
    status: "warning",
  },
  {
    step: 5,
    title: "Cheat Detection Triggered",
    description: "One day, Rohit copies code from GitHub.",
    detected: ["Sudden large commit", "Coding pattern mismatch"],
    action: "Task reset + Warning + Explain-your-code test",
    status: "error",
  },
  {
    step: 6,
    title: "Final Outcome — 6 Weeks Later",
    description: "Rohit completes the project with verifiable ownership.",
    results: [
      "Fully working project",
      "Git history (proof he coded)",
      "Backend + frontend confidence",
      "Interview-ready explanation ability",
    ],
    note: "❌ Certificate nahi | ✅ Real skill",
    status: "success",
  },
];

const CaseStudySection = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary mb-4">
            CASE STUDY
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Rohit ki <span className="text-gradient">Real Journey</span>
          </h2>
          <p className="text-muted-foreground">
            A 2nd year CSE student who stopped wasting time on YouTube tutorials 
            and actually built his project.
          </p>
        </div>

        {/* Student Profile */}
        <div className="max-w-xl mx-auto mb-12 p-6 rounded-xl border border-border bg-card/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Rohit</h3>
              <p className="text-muted-foreground">2nd Year CSE • Basic React • Zero Backend</p>
              <p className="text-sm text-warning mt-1 font-mono">
                Problem: YouTube se kuch complete nahi hota
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={item.step} className="relative pl-16">
                  {/* Step indicator */}
                  <div className={`absolute left-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg ${
                    item.status === "success" ? "bg-success/10 border-success text-success" :
                    item.status === "warning" ? "bg-warning/10 border-warning text-warning" :
                    item.status === "error" ? "bg-error/10 border-error text-error" :
                    "bg-secondary border-border text-muted-foreground"
                  }`}>
                    {item.step}
                  </div>

                  {/* Content */}
                  <div className={`p-6 rounded-xl border transition-all duration-300 ${
                    item.status === "success" ? "border-success/30 bg-success/5" :
                    item.status === "warning" ? "border-warning/30 bg-warning/5" :
                    item.status === "error" ? "border-error/30 bg-error/5" :
                    "border-border bg-card/50"
                  }`}>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-muted-foreground mb-3">{item.description}</p>

                    {item.detail && (
                      <p className="text-sm font-mono text-primary mb-2">{item.detail}</p>
                    )}

                    {item.outcome && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-success font-medium">{item.outcome}</span>
                      </div>
                    )}

                    {item.milestones && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.milestones.map((m) => (
                          <span key={m} className="px-2 py-1 rounded text-xs font-mono bg-secondary text-muted-foreground">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.aiInteraction && (
                      <div className="mt-3 p-3 rounded bg-secondary/50 text-sm">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-foreground">"{item.aiInteraction.ai}"</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.aiInteraction.note}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.mentorFeedback && (
                      <div className="mt-3 p-3 rounded bg-warning/10 border border-warning/20 text-sm">
                        <p className="text-warning font-medium">Mentor: "{item.mentorFeedback}"</p>
                        <p className="text-muted-foreground mt-1">{item.outcome}</p>
                      </div>
                    )}

                    {item.detected && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-error text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Detected:
                        </div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {item.detected.map((d) => <li key={d}>{d}</li>)}
                        </ul>
                        <p className="text-sm font-mono text-warning">Action: {item.action}</p>
                      </div>
                    )}

                    {item.results && (
                      <div className="mt-3 space-y-2">
                        {item.results.map((r) => (
                          <div key={r} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span>{r}</span>
                          </div>
                        ))}
                        <p className="text-sm font-bold mt-4 text-primary">{item.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="max-w-2xl mx-auto mt-16 p-8 rounded-xl border border-primary/30 bg-primary/5 text-center">
          <Award className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-black mb-2">Bottom Line</h3>
          <p className="text-lg text-muted-foreground mb-4">
            AMIT–BODHIT project banwata nahi — <span className="text-foreground font-semibold">banwana sikhata hai</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Shortcut lene walon ko bhaga deta hai. Builders ko strong bana deta hai.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
