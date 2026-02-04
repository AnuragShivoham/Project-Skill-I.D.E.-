import { useState } from "react";
import { useFileSystem } from "@/hooks/useFileSystem";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Download, Upload, RefreshCw, FileText, Folder, Trash2, Edit2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProgress } from '@/hooks/useProgress';

const FileOperationsPanel = () => {
  const fileSystem = useFileSystem();
  const { toast } = useToast();
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newContent, setNewContent] = useState("");
  const [importData, setImportData] = useState("");
  const stats = fileSystem.getStats();
  const { saveProgress } = useProgress();

  const handleCreateFile = () => {
    if (!newPath.trim()) {
      toast({ title: "Error", description: "Path is required", variant: "destructive" });
      return;
    }
    try {
      fileSystem.createFile(newPath, newContent, "typescript");
      toast({ title: "Success", description: `File created: ${newPath}` });
      setNewPath("");
      setNewContent("");
      setShowCreateFile(false);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleCreateFolder = () => {
    if (!newPath.trim()) {
      toast({ title: "Error", description: "Path is required", variant: "destructive" });
      return;
    }
    try {
      fileSystem.createFolder(newPath);
      toast({ title: "Success", description: `Folder created: ${newPath}` });
      setNewPath("");
      setShowCreateFolder(false);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleExport = () => {
    const json = fileSystem.exportProject();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bodhit-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Project exported" });
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast({ title: "Error", description: "Please paste project JSON", variant: "destructive" });
      return;
    }
    try {
      fileSystem.importProject(importData);
      toast({ title: "Success", description: "Project imported" });
      setImportData("");
      setShowImport(false);
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const handleReset = () => {
    if (confirm("Reset project to defaults? This cannot be undone.")) {
      fileSystem.resetProject();
      toast({ title: "Success", description: "Project reset to defaults" });
    }
  };

  return (
    <div className="p-4 border-t border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Project Stats</h3>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{stats.totalFiles} Files</Badge>
            <Badge variant="outline">{stats.totalFolders} Folders</Badge>
            <Badge variant="outline">{(stats.totalSize / 1024).toFixed(2)} KB</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setShowCreateFile(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          New File
        </Button>
        <Button
          onClick={() => setShowCreateFolder(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Folder className="w-4 h-4" />
          New Folder
        </Button>
        <Button onClick={() => setShowExport(true)} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          onClick={() => setShowImport(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button
          onClick={async () => {
            // Save a progress snapshot
            const entry = await saveProgress({
              title: 'Manual Save',
              description: 'Saved from IDE File Operations panel',
              filesSnapshot: fileSystem.getAllFiles(),
            });
            toast({ title: 'Progress saved', description: `Saved ${entry.id}` });
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          Save Progress
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm" className="gap-2 col-span-2">
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Create File Dialog */}
      <Dialog open={showCreateFile} onOpenChange={setShowCreateFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>Create a new file in your project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="/src/components/MyFile.tsx"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
            />
            <Textarea
              placeholder="Initial content (optional)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFile(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Create a new folder in your project</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="/src/hooks"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Project</DialogTitle>
            <DialogDescription>Download your project as JSON</DialogDescription>
          </DialogHeader>
          <Textarea
            value={fileSystem.exportProject()}
            readOnly
            rows={10}
            className="font-mono text-xs"
          />
          <DialogFooter>
            <Button onClick={handleExport}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Project</DialogTitle>
            <DialogDescription>Paste your project JSON to restore it</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Paste project JSON here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileOperationsPanel;
