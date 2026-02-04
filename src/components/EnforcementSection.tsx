import { ShieldAlert, Eye, GitCommit, Brain, AlertTriangle, Ban, RotateCcw, FileQuestion } from "lucide-react";

const detectionMethods = [
  {
    icon: Eye,
    title: "Pattern Analysis",
    description: "We analyze your typing rhythm, pause patterns, and editing behavior to detect copy-paste.",
  },
  {
    icon: GitCommit,
    title: "Commit Forensics",
    description: "Sudden large commits after no activity? Inconsistent code style? We flag it.",
  },
  {
    icon: Brain,
    title: "AI Over-reliance Detection",
    description: "If your code quality suddenly jumps without corresponding learning activity, we investigate.",
  },
  {
    icon: FileQuestion,
    title: "Explain-Your-Code Tests",
    description: "Random checkpoints where you must explain what your code does. Fail? Task resets.",
  },
];

const consequences = [
  {
    icon: AlertTriangle,
    level: "Warning",
    description: "First offense: Yellow flag, required explanation",
    color: "warning",
  },
  {
    icon: RotateCcw,
    level: "Task Reset",
    description: "Second offense: Current task progress wiped",
    color: "accent",
  },
  {
    icon: Ban,
    level: "Project Termination",
    description: "Repeated abuse: Removed from platform",
    color: "error",
  },
];

const EnforcementSection = () => {
  return (
    <section id="enforcement" className="py-24 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warning/30 bg-warning/5 text-sm font-mono text-warning mb-4">
            <ShieldAlert className="w-4 h-4" />
            ENFORCEMENT
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Zero Tolerance for <span className="text-warning">Shortcuts</span>
          </h2>
          <p className="text-muted-foreground">
            We built systems that catch cheaters. If you're here to bypass learning, 
            you'll get caught and removed.
          </p>
        </div>

        {/* Detection Methods */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-xl font-bold text-center mb-8">How We Detect Abuse</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {detectionMethods.map((method) => (
              <div 
                key={method.title}
                className="group p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-warning/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0 group-hover:bg-warning/20 transition-colors">
                    <method.icon className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{method.title}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consequences */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-8">Consequences of Cheating</h3>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {consequences.map((consequence, index) => (
              <div 
                key={consequence.level}
                className={`flex-1 p-6 rounded-xl border bg-card/50 relative overflow-hidden ${
                  consequence.color === "warning" ? "border-warning/30" :
                  consequence.color === "accent" ? "border-accent/30" :
                  "border-error/30"
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  consequence.color === "warning" ? "bg-warning" :
                  consequence.color === "accent" ? "bg-accent" :
                  "bg-error"
                }`} />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  consequence.color === "warning" ? "bg-warning/10" :
                  consequence.color === "accent" ? "bg-accent/10" :
                  "bg-error/10"
                }`}>
                  <consequence.icon className={`w-6 h-6 ${
                    consequence.color === "warning" ? "text-warning" :
                    consequence.color === "accent" ? "text-accent" :
                    "text-error"
                  }`} />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  LEVEL {index + 1}
                </div>
                <h4 className="font-bold mb-2">{consequence.level}</h4>
                <p className="text-sm text-muted-foreground">{consequence.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="max-w-3xl mx-auto mt-16 p-6 rounded-xl border border-error/30 bg-error/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-error flex-shrink-0" />
            <div>
              <h4 className="font-bold text-error mb-2">Fair Warning</h4>
              <p className="text-muted-foreground">
                This platform is not for people who want their projects done for them. 
                If you're looking for a "get project quick" scheme, leave now. 
                We will catch you, and you will lose your money and access.
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                → Average cheater detection: &lt; 48 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnforcementSection;
