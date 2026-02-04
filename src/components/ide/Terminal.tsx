import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, Minimize2, Maximize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "info";
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const Terminal = ({ isExpanded, onToggle }: TerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "info", content: "AMIT–BODHIT Terminal v1.0", timestamp: new Date() },
    { type: "info", content: "Type 'help' for available commands", timestamp: new Date() },
    { type: "output", content: "", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", content: `$ ${cmd}`, timestamp: new Date() },
    ];

    const command = cmd.trim().toLowerCase();

    if (command === "help") {
      newLines.push({
        type: "output",
        content: `Available commands:
  help     - Show this help message
  clear    - Clear terminal
  status   - Check project status
  test     - Run tests
  commit   - Commit your changes`,
        timestamp: new Date(),
      });
    } else if (command === "clear") {
      setLines([]);
      setInput("");
      return;
    } else if (command === "status") {
      newLines.push({
        type: "success",
        content: "✓ Current task: Implement JWT Authentication",
        timestamp: new Date(),
      });
      newLines.push({
        type: "info",
        content: "  Progress: 2/5 steps completed",
        timestamp: new Date(),
      });
    } else if (command === "test") {
      newLines.push({
        type: "info",
        content: "Running tests...",
        timestamp: new Date(),
      });
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "success", content: "✓ 3 tests passed", timestamp: new Date() },
          { type: "error", content: "✗ 1 test failed: auth.test.ts", timestamp: new Date() },
          { type: "info", content: "  Expected token to be valid, received undefined", timestamp: new Date() },
        ]);
      }, 1000);
    } else if (command === "commit") {
      newLines.push({
        type: "error",
        content: "✗ Cannot commit: Tests must pass first",
        timestamp: new Date(),
      });
      newLines.push({
        type: "info",
        content: "  Run 'test' and fix failing tests before committing",
        timestamp: new Date(),
      });
    } else if (command) {
      newLines.push({
        type: "error",
        content: `Command not found: ${cmd}`,
        timestamp: new Date(),
      });
    }

    setLines(newLines);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
    }
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":
        return "text-ide-error";
      case "success":
        return "text-ide-success";
      case "info":
        return "text-ide-info";
      case "input":
        return "text-primary";
      default:
        return "text-foreground";
    }
  };

  return (
    <div
      className={cn(
        "bg-ide-terminal border-t border-border transition-all duration-300",
        isExpanded ? "h-64" : "h-10"
      )}
    >
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer border-b border-border"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          ) : (
            <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div
          className="h-[calc(100%-40px)] font-mono text-sm p-4 overflow-auto"
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, index) => (
            <div key={index} className={cn("leading-relaxed", getLineColor(line.type))}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-primary mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;
