# IDE File System Integration Guide

## Overview

The AMIT–BODHIT IDE now includes a complete file management system with full access to project files, structure, and localStorage persistence. The chatbot can now see and reference the entire project while providing guidance.

## Features

### 1. **File Operations**
- ✅ Create files and folders
- ✅ Read file contents
- ✅ Update/edit file contents
- ✅ Delete files and folders
- ✅ Rename files
- ✅ View project structure and statistics

### 2. **Storage & Persistence**
- ✅ All files stored in browser localStorage
- ✅ Automatic saving on every change
- ✅ Project state preserved across sessions
- ✅ Export/Import projects as JSON

### 3. **Chatbot Integration**
- ✅ Chatbot can see all project files
- ✅ Chatbot knows project structure
- ✅ References files when providing guidance
- ✅ Suggests file creation/organization

## Architecture

### File System Service (`src/services/IDEFileSystem.ts`)

Core file management engine with localStorage persistence.

```typescript
const fileSystem = new IDEFileSystem();

// Create file
fileSystem.createFile("/src/components/Button.tsx", "export const Button = () => ...", "typescript");

// Read file
const file = fileSystem.getFile("/src/components/Button.tsx");
console.log(file.content);

// Update file
fileSystem.updateFile("/src/components/Button.tsx", "new content...");

// Delete file
fileSystem.delete("/src/components/Button.tsx");

// Rename file
fileSystem.rename("/src/components/Button.tsx", "CustomButton.tsx");

// List directory
const files = fileSystem.listDirectory("/src/components");

// Export/Import
const json = fileSystem.exportToJSON();
fileSystem.importFromJSON(json);

// Statistics
const stats = fileSystem.getStats();
// { totalFiles: 10, totalFolders: 5, totalSize: 45230 }
```

### File System Context Hook (`src/hooks/useFileSystem.ts`)

React context for accessing file system in components.

```typescript
import { useFileSystem } from "@/hooks/useFileSystem";

const MyComponent = () => {
  const {
    files,              // All files as Record<path, FileNode>
    selectedFile,       // Currently selected file path
    selectFile,         // Change selected file
    createFile,         // Create new file
    createFolder,       // Create new folder
    updateFile,         // Edit file content
    deleteFile,         // Delete file
    renameFile,         // Rename file
    listDirectory,      // List folder contents
    exportProject,      // Get JSON export
    importProject,      // Import from JSON
    resetProject,       // Reset to defaults
    getStats,           // Get project statistics
    getFileTree,        // Get tree structure for UI
  } = useFileSystem();

  // Use in your component
  return <div>Total files: {getStats().totalFiles}</div>;
};
```

### File Operations Panel (`src/components/ide/FileOperationsPanel.tsx`)

UI component for file operations with dialogs:
- New File → Creates file with optional initial content
- New Folder → Creates a directory
- Export → Downloads project as JSON file
- Import → Uploads project JSON
- Reset → Resets to default project structure

## File Structure

```
Project
├── /src
│   ├── /components
│   │   ├── Auth.tsx         (file)
│   │   └── Dashboard.tsx    (file)
│   ├── /api
│   │   ├── auth.ts          (file)
│   │   └── attendance.ts    (file)
│   ├── App.tsx              (file)
│   └── main.tsx             (file)
├── package.json             (file)
└── README.md                (file)
```

## How the Chatbot Uses File Context

### 1. Project Awareness
When a student asks a question, the chatbot receives:
- List of all files in the project
- Project structure (paths, types, languages)
- Currently edited file content
- Current task/milestone

### 2. Intelligent Guidance
The bot can now:
```
Student: "I'm stuck on implementing the auth component"
Bot: "I see you're working on /src/components/Auth.tsx. 
Let's think about the structure. 

Looking at your project:
- You have /src/api/auth.ts (API functions)
- You have /src/App.tsx (main component)

Before building the form, think about:
1. What fields should the login form have?
2. Where should the form state live?
3. How will you call the API when user submits?

Tell me your approach and I'll guide you through implementation."
```

### 3. Milestone Validation
The bot can check if student has created required files:
```
Student: "I completed authentication milestone"
Bot: "Great! Let me verify. I see you have:
✓ /src/components/Auth.tsx
✓ /src/api/auth.ts
? /src/hooks/useAuth.ts (suggested but not required)

Can you describe what each file does?"
```

## localStorage Schema

Files are stored as JSON in `localStorage['BODHIT_IDE_FILES']`:

```json
{
  "/src/components/Auth.tsx": {
    "id": "auth-component",
    "path": "/src/components/Auth.tsx",
    "name": "Auth.tsx",
    "type": "file",
    "content": "import React from 'react';...",
    "language": "typescript",
    "createdAt": 1706860800000,
    "updatedAt": 1706860900000
  },
  "/src/components": {
    "id": "dir-src-components",
    "path": "/src/components",
    "name": "components",
    "type": "folder",
    "children": [],
    "createdAt": 1706860800000,
    "updatedAt": 1706860800000
  }
}
```

## Limits & Considerations

| Aspect | Limit | Notes |
|--------|-------|-------|
| Max Storage | ~5-10 MB | Browser localStorage limit |
| Max File Size | ~1 MB | Practical limit for in-memory |
| Max Files | ~500 | Before performance degrades |
| Path Length | 255 chars | OS-level constraint |
| Persistence | Session | Persists across browser restarts |

## API Reference

### FileNode Interface

```typescript
interface FileNode {
  id: string;              // Unique identifier
  path: string;            // Absolute path: /src/components/Auth.tsx
  name: string;            // File/folder name: Auth.tsx
  type: "file" | "folder"; // Node type
  content?: string;        // File content (files only)
  children?: FileNode[];   // Sub-items (folders only)
  language?: string;       // Language: typescript, javascript, json
  createdAt: number;       // Timestamp
  updatedAt: number;       // Last modified timestamp
}
```

### IDEFileSystem Methods

```typescript
// CRUD Operations
createFile(path: string, content?: string, language?: string): FileNode
createFolder(path: string): FileNode
getFile(path: string): FileNode | null
updateFile(path: string, content: string): FileNode
delete(path: string): void
rename(oldPath: string, newName: string): FileNode

// Navigation
listDirectory(dirPath: string): FileNode[]
getFileTree(): FileNode[]
getAllFiles(): Record<string, FileNode>

// Data Management
exportToJSON(): string
exportAsZip(): Blob
importFromJSON(jsonString: string): void
reset(): void

// Statistics
getStats(): { totalFiles, totalFolders, totalSize }

// Subscriptions
subscribe(callback: () => void): () => void
```

## Integration with Chatbot

The chatbot system prompt now includes:

```
PROJECT FILES CONTEXT:
- List of all files in student's project
- Project structure and file types
- Current file being edited
- Language information for each file

This allows the bot to:
1. Suggest which files to create/modify
2. Ask about file organization
3. Reference specific files in guidance
4. Validate milestone completion
5. Guide students on project architecture
```

## Example: Creating Files from Chatbot Guidance

**Student**: "How should I organize my authentication code?"

**Bot**: 
```
Based on your current project, here's what I suggest:

Current structure:
/src/components/Auth.tsx ✓
/src/api/auth.ts ✓

I recommend adding:
1. /src/hooks/useAuth.tsx - Custom hook for auth state
2. /src/types/auth.ts - TypeScript types for auth

Think about:
- Should the hook be in /src/hooks or /src/contexts?
- Where should user session be stored?
- How will components access the authenticated user?

What's your approach?
```

**Student then creates files and chatbot guides them through implementation.**

## Exporting & Importing Projects

### Export Project
1. Click "Export" in File Operations Panel
2. Downloads `bodhit-project-{timestamp}.json`
3. Contains all files and folder structure

### Import Project
1. Click "Import" in File Operations Panel
2. Paste JSON content
3. All files restored to project

**Use case**: 
- Save work before browser clear
- Share project with mentor
- Backup before major refactoring

## Troubleshooting

### Issue: Files not saving
**Solution**: Check browser's localStorage is enabled
```javascript
// Verify localStorage works
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should print 'value'
```

### Issue: localStorage quota exceeded
**Solution**: Export and clear old files
```javascript
// Check storage usage
const stats = fileSystem.getStats();
console.log(stats.totalSize); // Size in bytes
```

### Issue: Files lost after browser refresh
**Solution**: Files persist automatically. If lost:
1. Check if localStorage was cleared
2. Look for backup exports
3. Use "Reset to Defaults" to restore

## Next Features (Roadmap)

- [ ] Syntax highlighting per language
- [ ] File search across project
- [ ] File diff viewer
- [ ] Version history (undo/redo)
- [ ] Collaborative editing (multi-user)
- [ ] Git integration
- [ ] File templates
- [ ] Project templates

## Files Modified

### New Files
- `src/services/IDEFileSystem.ts` — Core file system service
- `src/hooks/useFileSystem.ts` — React context hook
- `src/components/ide/FileOperationsPanel.tsx` — UI for file operations

### Updated Files
- `src/components/ide/IDEWorkspace.tsx` — Integrated FileSystemProvider
- `src/components/ide/AIChatPanel.tsx` — Now receives project files
- `supabase/functions/bodhit-chat/index.ts` — Enhanced to use project context

## Testing the Integration

1. **Start IDE**: Navigate to `/ide` page
2. **Create a file**: Click "New File" → `/src/hooks/useAuth.tsx`
3. **Edit file**: Write some code in the editor
4. **Open chat**: Ask "What files do I have in my project?"
5. **Export project**: Click "Export" and save the JSON
6. **Verify persistence**: Refresh page — files should persist
7. **Import different project**: Create new JSON and import

---

**Status**: ✅ Complete and integrated
**Testing**: All operations tested and working
**Deployment**: Ready for production
