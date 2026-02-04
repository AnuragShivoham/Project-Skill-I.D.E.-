import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";
import AIChatPanel from "./AIChatPanel";
import FileOperationsPanel from "./FileOperationsPanel";
import { useFileSystem, FileSystemProvider } from "@/hooks/useFileSystem";
import { ConversationHistory } from "@/components/ConversationHistory";

const IDEWorkspaceContent = () => {
  const { files, selectedFile, selectFile, updateFile } = useFileSystem();
  const currentFileNode = selectedFile ? files[selectedFile] : null;
  const code = currentFileNode?.content || "";

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined && selectedFile) {
      updateFile(selectedFile, value);
    }
  };

  return (
    <div className="h-screen bg-ide-bg">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Conversation History */}
        <ResizablePanel defaultSize={12} minSize={10} maxSize={20}>
          <ConversationHistory />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* File Explorer */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <div className="flex flex-col h-full">
            <FileExplorer onFileSelect={selectFile} selectedFile={selectedFile} />
            <FileOperationsPanel />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor + Terminal */}
        <ResizablePanel defaultSize={55}>
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <CodeEditor
                selectedFile={selectedFile}
                code={code}
                onChange={handleCodeChange}
              />
            </div>
            <Terminal isExpanded={true} onToggle={() => {}} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* AI Chat Panel */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <AIChatPanel 
            currentTask="Implement JWT Authentication" 
            currentCode={code}
            currentFiles={files}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

const IDEWorkspace = () => {
  return (
    <FileSystemProvider>
      <IDEWorkspaceContent />
    </FileSystemProvider>
  );
};

export default IDEWorkspace;
