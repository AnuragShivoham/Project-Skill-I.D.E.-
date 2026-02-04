import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { fileSystem, FileNode } from "@/services/IDEFileSystem";

interface FileSystemContextType {
  files: Record<string, FileNode>;
  selectedFile: string | null;
  selectFile: (path: string) => void;
  createFile: (path: string, content?: string, language?: string) => FileNode;
  createFolder: (path: string) => FileNode;
  updateFile: (path: string, content: string) => FileNode;
  deleteFile: (path: string, recursive?: boolean) => Record<string, FileNode> | void;
  renameFile: (oldPath: string, newName: string) => FileNode;
  undoDelete: () => void;
  listDirectory: (path: string) => FileNode[];
  exportProject: () => string;
  importProject: (json: string) => void;
  resetProject: () => void;
  getStats: () => { totalFiles: number; totalFolders: number; totalSize: number };
  getFileTree: () => FileNode[];
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<Record<string, FileNode>>(fileSystem.getAllFiles());
  const [selectedFile, setSelectedFile] = useState<string | null>("/src/components/Auth.tsx");
  const [lastDeleted, setLastDeleted] = useState<Record<string, FileNode> | null>(null);
  const { toast } = ({} as any) as { toast: any };

  // Subscribe to file system changes
  useEffect(() => {
    const unsubscribe = fileSystem.subscribe(() => {
      setFiles(fileSystem.getAllFiles());
    });
    return unsubscribe;
  }, []);

  const selectFile = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  const createFile = useCallback((path: string, content = "", language = "text") => {
    const file = fileSystem.createFile(path, content, language);
    setFiles(fileSystem.getAllFiles());
    return file;
  }, []);

  const createFolder = useCallback((path: string) => {
    const folder = fileSystem.createFolder(path);
    setFiles(fileSystem.getAllFiles());
    return folder;
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    const file = fileSystem.updateFile(path, content);
    setFiles(fileSystem.getAllFiles());
    return file;
  }, []);

  const deleteFile = useCallback((path: string, recursive = false) => {
    try {
      const deleted = fileSystem.delete(path, recursive);
      setFiles(fileSystem.getAllFiles());
      if (selectedFile === path) {
        setSelectedFile(null);
      }
      if (deleted) {
        setLastDeleted(deleted);
      }
      return deleted;
    } catch (err) {
      throw err;
    }
  }, [selectedFile]);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    fileSystem.restoreFiles(lastDeleted);
    setFiles(fileSystem.getAllFiles());
    setLastDeleted(null);
  }, [lastDeleted]);

  const renameFile = useCallback((oldPath: string, newName: string) => {
    const file = fileSystem.rename(oldPath, newName);
    setFiles(fileSystem.getAllFiles());
    if (selectedFile === oldPath) {
      setSelectedFile(file.path);
    }
    return file;
  }, [selectedFile]);

  const listDirectory = useCallback((path: string) => {
    return fileSystem.listDirectory(path);
  }, []);

  const exportProject = useCallback(() => {
    return fileSystem.exportToJSON();
  }, []);

  const importProject = useCallback((json: string) => {
    fileSystem.importFromJSON(json);
    setFiles(fileSystem.getAllFiles());
  }, []);

  const resetProject = useCallback(() => {
    fileSystem.reset();
    setFiles(fileSystem.getAllFiles());
    setSelectedFile("/src/components/Auth.tsx");
  }, []);

  const getStats = useCallback(() => {
    return fileSystem.getStats();
  }, []);

  const getFileTree = useCallback(() => {
    return fileSystem.getFileTree();
  }, []);

  const contextValue: FileSystemContextType = {
    files,
    selectedFile,
    selectFile,
    createFile,
    createFolder,
    updateFile,
    deleteFile,
    renameFile,
    undoDelete,
    listDirectory,
    exportProject,
    importProject,
    resetProject,
    getStats,
    getFileTree,
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within FileSystemProvider");
  }
  return context;
};
