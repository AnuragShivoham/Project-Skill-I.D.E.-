import { ArrowRight, GitBranch, Shield, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-mono text-primary">No shortcuts. No outsourcing. Only building.</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Stop <span className="text-gradient">Outsourcing</span> Projects.
            <br />
            <span className="text-muted-foreground">Start</span> Building Them.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A co-building platform where you write every line of code — with enforced guidance, 
            real mentorship, and zero tolerance for shortcuts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/submit-project">
                Submit Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Code2 className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">100%</span>
              </div>
              <p className="text-sm text-muted-foreground">Your Code</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitBranch className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">Copy-Paste Allowed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">Real</span>
              </div>
              <p className="text-sm text-muted-foreground">Skills Gained</p>
            </div>
          </div>
        </div>

        {/* IDE Preview hint */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-card/50 overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {/* IDE Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-secondary text-xs font-mono">
                  <Code2 className="w-3 h-3" />
                  auth-system / login.tsx
                </div>
              </div>
            </div>
            
            {/* IDE Content Preview */}
            <div className="p-6 font-mono text-sm">
              <div className="flex gap-4">
                {/* Line numbers */}
                <div className="text-muted-foreground/50 select-none text-right">
                  {[1,2,3,4,5,6,7].map(n => <div key={n}>{n}</div>)}
                </div>
                {/* Code */}
                <div className="flex-1">
                  <div><span className="text-primary">const</span> <span className="text-warning">handleLogin</span> = <span className="text-primary">async</span> () =&gt; {'{'}</div>
                  <div className="pl-4"><span className="text-muted-foreground">// You write this logic</span></div>
                  <div className="pl-4"><span className="text-muted-foreground">// AI explains, but never gives answers</span></div>
                  <div className="pl-4"><span className="text-primary">const</span> token = <span className="text-warning">await</span> <span className="text-foreground">_</span><span className="border-r-2 border-primary animate-blink" /></div>
                  <div className="pl-4" />
                  <div className="pl-4 text-muted-foreground">{'// No commits = No progress'}</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
