import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useToast } from "@/hooks/use-toast";

interface FileExplorerProps {
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

const TreeNode = ({ node, depth, onFileSelect, selectedFile }: any) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile === node.path;
  const fs = useFileSystem();
  const { toast } = useToast();

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${node.path}?`)) return;
    try {
      if (node.type === "folder") {
        // For folders, check if there are ANY nested files/folders
        const prefix = node.path.endsWith("/") ? node.path : node.path + "/";
        const allFiles = Object.keys(fs.files);
        const hasChildren = allFiles.some(p => p.startsWith(prefix) && p !== node.path);
        
        if (hasChildren) {
          const doRecursive = confirm("Folder is not empty. Delete recursively?");
          if (!doRecursive) return;
        }
        fs.deleteFile(node.path, true);
      } else {
        fs.deleteFile(node.path);
      }
      toast({ title: "Deleted", description: `${node.path} deleted` });
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 cursor-pointer text-sm transition-colors",
          "hover:bg-muted/50 rounded-sm",
          isSelected && "bg-primary/20 text-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-ide-folder" />
            ) : (
              <Folder className="w-4 h-4 text-ide-folder" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 text-ide-file" />
          </>
        )}
        <span className="truncate flex-1">{node.name}</span>
        <button className="opacity-0 group-hover:opacity-100" onClick={handleDelete} title="Delete">
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ onFileSelect, selectedFile }: FileExplorerProps) => {
  const fs = useFileSystem();
  const tree = fs.getFileTree();

  return (
    <div className="h-full bg-ide-sidebar border-r border-border">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explorer
        </h3>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded bg-transparent hover:bg-muted/30"
            onClick={() => {
              const path = prompt('Enter new file path (e.g. /src/components/NewFile.tsx)');
              if (!path) return;
              try {
                fs.createFile(path, '// new file');
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
              }
            }}
          >
            New File
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-transparent hover:bg-muted/30"
            onClick={() => {
              const path = prompt('Enter new folder path (e.g. /src/hooks)');
              if (!path) return;
              try {
                fs.createFolder(path);
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
              }
            }}
          >
            New Folder
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-transparent hover:bg-muted/30"
            onClick={() => {
              try {
                // @ts-ignore
                if (fs && typeof fs.undoDelete === 'function') {
                  // @ts-ignore
                  fs.undoDelete();
                } else {
                  alert('Nothing to undo');
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
              }
            }}
          >
            Undo
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-transparent hover:bg-muted/30 text-destructive"
            onClick={() => {
              if (!selectedFile) {
                alert('Please select a file or folder to delete');
                return;
              }
              if (!confirm(`Delete ${selectedFile}?`)) return;
              try {
                const selectedNode = fs.files[selectedFile];
                if (selectedNode && selectedNode.type === "folder") {
                  // Check for any nested files
                  const prefix = selectedFile.endsWith("/") ? selectedFile : selectedFile + "/";
                  const allFiles = Object.keys(fs.files);
                  const hasChildren = allFiles.some(p => p.startsWith(prefix) && p !== selectedFile);
                  
                  if (hasChildren) {
                    const doRecursive = confirm('Folder is not empty. Delete recursively?');
                    if (!doRecursive) return;
                  }
                  fs.deleteFile(selectedFile, true);
                } else {
                  fs.deleteFile(selectedFile);
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="py-2">
          {tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
