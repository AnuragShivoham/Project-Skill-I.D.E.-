import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  selectedFile: string | null;
  code: string;
  onChange: (value: string | undefined) => void;
}

const getLanguage = (path: string | null): string => {
  if (!path) return "typescript";
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  return "typescript";
};

const CodeEditor = ({ selectedFile, code, onChange }: CodeEditorProps) => {
  return (
    <div className="h-full w-full bg-ide-editor">
      {selectedFile ? (
        <>
          <div className="h-9 bg-ide-sidebar border-b border-border flex items-center px-4">
            <span className="text-sm text-muted-foreground">{selectedFile}</span>
          </div>
          <Editor
            height="calc(100% - 36px)"
            language={getLanguage(selectedFile)}
            value={code}
            onChange={onChange}
            theme="vs-dark"
            loading={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            }
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: "on",
              glyphMargin: true,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              tabSize: 2,
              wordWrap: "on",
            }}
          />
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">Select a file to start coding</p>
            <p className="text-sm">Your journey begins with the first line</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
