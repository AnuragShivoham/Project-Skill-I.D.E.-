/**
 * IDEFileSystem Service
 * Manages file operations (create, read, update, delete, rename)
 * with localStorage persistence and directory structure
 */

export interface FileNode {
  id: string;
  path: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  language?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FileSystemState {
  files: Record<string, FileNode>;
  root: FileNode;
}

const STORAGE_KEY = "BODHIT_IDE_FILES";
const DEFAULT_FILES: Record<string, FileNode> = {
  "/src/components/Auth.tsx": {
    id: "auth-component",
    path: "/src/components/Auth.tsx",
    name: "Auth.tsx",
    type: "file",
    language: "typescript",
    content: `import React, { useState } from 'react';

/**
 * Simple Auth component used inside the in-browser IDE preview.
 * Note: For production, prefer httpOnly secure cookies for JWTs.
 */
const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Login failed');
      }

      const data = await res.json();
      const token = data.token || data.accessToken;
      if (!token) throw new Error('No token returned from server');

      // For demo purposes we store the JWT in localStorage. In production,
      // prefer setting an httpOnly secure cookie from the server to mitigate XSS.
      localStorage.setItem('auth_token', token);

      // Redirect to dashboard (or update auth context)
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      <p className="text-xs text-gray-500 mt-3">Security note: storing JWT in localStorage is easy but vulnerable to XSS attacks. For production, set httpOnly secure cookies from the server.</p>
    </div>
  );
};

export default Auth;`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "/src/components/Dashboard.tsx": {
    id: "dashboard-component",
    path: "/src/components/Dashboard.tsx",
    name: "Dashboard.tsx",
    type: "file",
    language: "typescript",
    content: `import { useEffect, useState } from 'react';

// Dashboard component - Shows after successful authentication
// This file is LOCKED until Auth.tsx passes all tests

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>You'll build this after completing authentication</p>
    </div>
  );
};

export default Dashboard;`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  "/src/api/auth.ts": {
    id: "auth-api",
    path: "/src/api/auth.ts",
    name: "auth.ts",
    type: "file",
    language: "typescript",
    content: `// Authentication API functions
// Implement these functions to handle JWT tokens

export const login = async (email: string, password: string) => {
  // TODO: Implement login API call
  // Return the JWT token on success
};

export const verifyToken = (token: string): boolean => {
  // TODO: Verify if token is valid
  // Hint: Check expiration and signature
  return false;
};

export const logout = () => {
  // TODO: Clear stored token
};`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
};

export class IDEFileSystem {
  private files: Record<string, FileNode>;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.files = this.loadFromStorage();
  }

  /**
   * Load files from localStorage or use defaults
   */
  private loadFromStorage(): Record<string, FileNode> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn("Failed to load files from storage:", err);
    }
    return { ...DEFAULT_FILES };
  }

  /**
   * Save files to localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.files));
    } catch (err) {
      console.error("Failed to save files to storage:", err);
    }
    this.notifyListeners();
  }

  /**
   * Subscribe to file changes
   */
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }

  /**
   * Get all files
   */
  getAllFiles(): Record<string, FileNode> {
    return this.files;
  }

  /**
   * Get a specific file by path
   */
  getFile(path: string): FileNode | null {
    return this.files[path] || null;
  }

  /**
   * Create a new file
   */
  createFile(path: string, content: string = "", language: string = "text"): FileNode {
    if (this.files[path]) {
      throw new Error(`File already exists: ${path}`);
    }

    const fileName = path.split("/").pop() || "untitled";
    const newFile: FileNode = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      path,
      name: fileName,
      type: "file",
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.files[path] = newFile;
    this.saveToStorage();
    return newFile;
  }

  /**
   * Create a new folder
   */
  createFolder(path: string): FileNode {
    if (this.files[path]) {
      throw new Error(`Folder already exists: ${path}`);
    }

    const folderName = path.split("/").pop() || "untitled";
    const newFolder: FileNode = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      path,
      name: folderName,
      type: "folder",
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.files[path] = newFolder;
    this.saveToStorage();
    return newFolder;
  }

  /**
   * Update file content
   */
  updateFile(path: string, content: string): FileNode {
    const file = this.files[path];
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    if (file.type !== "file") {
      throw new Error(`Path is not a file: ${path}`);
    }

    file.content = content;
    file.updatedAt = Date.now();
    this.saveToStorage();
    return file;
  }

  /**
   * Rename a file or folder
   */
  rename(oldPath: string, newName: string): FileNode {
    const file = this.files[oldPath];
    if (!file) {
      throw new Error(`Path not found: ${oldPath}`);
    }

    // Calculate new path
    const pathParts = oldPath.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join("/");

    if (this.files[newPath]) {
      throw new Error(`Destination already exists: ${newPath}`);
    }

    // Move file to new path
    file.path = newPath;
    file.name = newName;
    file.updatedAt = Date.now();
    this.files[newPath] = file;
    delete this.files[oldPath];
    this.saveToStorage();
    return file;
  }

  /**
   * Delete a file or folder
   */
  delete(path: string, recursive = false): Record<string, FileNode> {
    if (!this.files[path]) {
      throw new Error(`Path not found: ${path}`);
    }

    const file = this.files[path];

    // Collect files to delete
    const toDelete: Record<string, FileNode> = {};

    if (file.type === "folder") {
      // Find children under this folder
      const prefix = path.endsWith("/") ? path : path + "/";
      for (const [p, node] of Object.entries(this.files)) {
        if (p === path || p.startsWith(prefix)) {
          toDelete[p] = node;
        }
      }

      if (Object.keys(toDelete).length > 1 && !recursive) {
        throw new Error(`Folder is not empty: ${path}`);
      }
    } else {
      toDelete[path] = file;
    }

    // Perform deletion
    for (const p of Object.keys(toDelete)) {
      delete this.files[p];
    }

    this.saveToStorage();
    return toDelete;
  }

  /**
   * List files in a directory
   */
  listDirectory(dirPath: string): FileNode[] {
    const items: FileNode[] = [];
    const dirWithSlash = dirPath.endsWith("/") ? dirPath : dirPath + "/";

    for (const [path, file] of Object.entries(this.files)) {
      if (path.startsWith(dirWithSlash) && path !== dirPath) {
        // Check if it's a direct child (no more slashes after the dir)
        const relative = path.slice(dirWithSlash.length);
        if (!relative.includes("/")) {
          items.push(file);
        }
      }
    }

    return items;
  }

  /**
   * Get file statistics
   */
  getStats(): {
    totalFiles: number;
    totalFolders: number;
    totalSize: number;
  } {
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;

    for (const file of Object.values(this.files)) {
      if (file.type === "file") {
        totalFiles++;
        totalSize += (file.content || "").length;
      } else {
        totalFolders++;
      }
    }

    return { totalFiles, totalFolders, totalSize };
  }

  /**
   * Export all files as a JSON object
   */
  exportToJSON(): string {
    return JSON.stringify(this.files, null, 2);
  }

  /**
   * Restore files from a deleted snapshot
   */
  restoreFiles(deletedFiles: Record<string, FileNode>) {
    for (const [p, node] of Object.entries(deletedFiles)) {
      this.files[p] = node;
    }
    this.saveToStorage();
  }

  /**
   * Export all files as a zip-like structure (as JSON string)
   */
  exportAsZip(): Blob {
    const json = this.exportToJSON();
    return new Blob([json], { type: "application/json" });
  }

  /**
   * Import files from JSON
   */
  importFromJSON(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString);
      if (typeof imported !== "object" || imported === null) {
        throw new Error("Invalid JSON format");
      }
      this.files = imported;
      this.saveToStorage();
    } catch (err) {
      throw new Error(`Failed to import files: ${err}`);
    }
  }

  /**
   * Clear all files and reset to defaults
   */
  reset(): void {
    this.files = { ...DEFAULT_FILES };
    this.saveToStorage();
  }

  /**
   * Get a tree structure of all files (for UI rendering)
   */
  getFileTree(): FileNode[] {
    const tree: FileNode[] = [];
    const processed = new Set<string>();

    // Group files by top-level directory
    const dirs: Record<string, FileNode[]> = {};

    for (const file of Object.values(this.files)) {
      const pathParts = file.path.split("/").filter(Boolean);
      if (pathParts.length === 0) continue;

      const topDir = pathParts[0];
      if (!dirs[topDir]) {
        dirs[topDir] = [];
      }
      dirs[topDir].push(file);
    }

    // Build tree
    for (const [dirName, files] of Object.entries(dirs)) {
      const dirNode: FileNode = {
        id: `dir-${dirName}`,
        path: `/${dirName}`,
        name: dirName,
        type: "folder",
        children: files.sort((a, b) => a.name.localeCompare(b.name)),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      tree.push(dirNode);
    }

    return tree.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Singleton instance
export const fileSystem = new IDEFileSystem();
