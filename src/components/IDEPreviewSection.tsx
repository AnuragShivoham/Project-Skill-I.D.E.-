import { Terminal, GitBranch, Play, FileCode, MessageSquare, Lock, Unlock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const IDEPreviewSection = () => {
  const [activeTab, setActiveTab] = useState("code");

  return (
    <section id="ide" className="py-24 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary mb-4">
            THE IDE
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Built-In <span className="text-gradient">Development Environment</span>
          </h2>
          <p className="text-muted-foreground">
            Write code, get guided — not spoonfed. The AI explains logic, never outputs solutions.
          </p>
        </div>

        {/* IDE Mockup */}
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-border bg-background overflow-hidden shadow-2xl">
            {/* IDE Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <span className="text-sm font-mono text-muted-foreground ml-4">
                  AMIT–BODHIT IDE
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-mono">main</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-success/10 text-success text-xs font-mono">
                  <CheckCircle className="w-3 h-3" />
                  Progress: 3/8 tasks
                </div>
              </div>
            </div>

            {/* IDE Main Layout */}
            <div className="flex h-[500px]">
              {/* File Explorer */}
              <div className="w-56 border-r border-border bg-card/50 p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Project Files
                </div>
                <div className="space-y-1">
                  {[
                    { name: "auth-system", status: "done", children: ["login.tsx", "signup.tsx"] },
                    { name: "database", status: "current", children: ["schema.sql", "migrations.ts"] },
                    { name: "api", status: "locked", children: ["routes.ts", "middleware.ts"] },
                    { name: "frontend", status: "locked", children: ["dashboard.tsx", "components/"] },
                  ].map((folder) => (
                    <div key={folder.name} className="text-sm">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded ${
                        folder.status === "current" ? "bg-primary/10 text-primary" : 
                        folder.status === "done" ? "text-success" : "text-muted-foreground"
                      }`}>
                        {folder.status === "locked" ? (
                          <Lock className="w-3 h-3" />
                        ) : folder.status === "done" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                        <span className="font-mono">{folder.name}/</span>
                      </div>
                      <div className="ml-4 mt-1 space-y-1">
                        {folder.children.map((file) => (
                          <div key={file} className={`flex items-center gap-2 px-2 py-0.5 text-xs font-mono ${
                            folder.status === "locked" ? "text-muted-foreground/50" : "text-muted-foreground hover:text-foreground"
                          }`}>
                            <FileCode className="w-3 h-3" />
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                {/* Tabs */}
                <div className="flex items-center border-b border-border bg-card/30">
                  {["code", "preview", "console"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-mono capitalize border-b-2 transition-colors ${
                        activeTab === tab 
                          ? "border-primary text-foreground" 
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Editor Content */}
                <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                  {activeTab === "code" && (
                    <div className="flex gap-4">
                      <div className="text-muted-foreground/50 select-none text-right">
                        {Array.from({ length: 18 }, (_, i) => i + 1).map(n => <div key={n}>{n}</div>)}
                      </div>
                      <div className="flex-1">
                        <div><span className="text-primary">import</span> {'{ createClient }'} <span className="text-primary">from</span> <span className="text-warning">'@supabase/supabase-js'</span>;</div>
                        <div />
                        <div><span className="text-primary">const</span> <span className="text-warning">connectDatabase</span> = <span className="text-primary">async</span> () =&gt; {'{'}</div>
                        <div className="pl-4"><span className="text-muted-foreground">// Your task: Initialize Supabase client</span></div>
                        <div className="pl-4"><span className="text-muted-foreground">// Learn: What is a connection string?</span></div>
                        <div className="pl-4" />
                        <div className="pl-4"><span className="text-primary">const</span> client = <span className="text-warning">createClient</span>(</div>
                        <div className="pl-8 text-foreground">_<span className="border-r-2 border-primary animate-blink" /></div>
                        <div className="pl-4">);</div>
                        <div className="pl-4" />
                        <div className="pl-4"><span className="text-primary">return</span> client;</div>
                        <div>{'}'}</div>
                        <div />
                        <div className="text-muted-foreground">{'// ⚠️ No commits in 2 hours = Progress locked'}</div>
                        <div className="text-muted-foreground">{'// 💡 Stuck? Ask the AI to EXPLAIN, not solve'}</div>
                      </div>
                    </div>
                  )}
                  {activeTab === "preview" && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Preview available after successful build</p>
                      </div>
                    </div>
                  )}
                  {activeTab === "console" && (
                    <div className="space-y-2 text-xs">
                      <div className="text-muted-foreground">[12:34:21] Compiling...</div>
                      <div className="text-success">[12:34:22] Build successful</div>
                      <div className="text-warning">[12:34:23] Warning: No tests written yet</div>
                      <div className="text-primary">[12:34:23] Task: database/schema.sql — IN PROGRESS</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Assistant Panel */}
              <div className="w-80 border-l border-border bg-card/50 flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    AI Guide
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Explains concepts. Never writes code.
                  </p>
                </div>
                
                <div className="flex-1 p-3 space-y-3 overflow-auto">
                  <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                    <div className="text-xs text-primary font-mono mb-2">CONTEXT: Database Connection</div>
                    <p className="text-muted-foreground mb-2">
                      You're initializing a Supabase client. This requires two pieces: a URL and an anon key.
                    </p>
                    <p className="text-foreground font-medium">
                      🤔 Do you know where to find these credentials?
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background border border-border text-sm">
                    <div className="text-xs text-muted-foreground mb-2">YOU</div>
                    <p>Just give me the code</p>
                  </div>

                  <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-sm">
                    <div className="flex items-center gap-2 text-xs text-error font-mono mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      GUIDANCE ONLY
                    </div>
                    <p className="text-muted-foreground">
                      I can't write the code for you. But I can explain:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                      <li>What each parameter does</li>
                      <li>Where to find your credentials</li>
                      <li>Common mistakes to avoid</li>
                    </ul>
                    <p className="mt-2 text-foreground font-medium">
                      Which would help you most?
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ask for guidance..."
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                    />
                    <button className="p-2 rounded-lg bg-primary text-primary-foreground">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Task: database/schema.sql</span>
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Uncommitted changes
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Effort: 2h 14m</span>
                <span>Lines written: 47</span>
                <span className="text-primary">TypeScript</span>
              </div>
            </div>
          </div>
        </div>

        {/* IDE Features */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: "Progress Locking",
              description: "No activity in 2 hours? Your task locks until you explain why.",
            },
            {
              icon: GitBranch,
              title: "Enforced Commits",
              description: "Every meaningful change must be committed. No commits = no progress.",
            },
            {
              icon: MessageSquare,
              title: "Guided AI",
              description: "AI explains, asks questions, and critiques — never gives answers.",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors">
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IDEPreviewSection;
