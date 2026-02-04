import { useState, useEffect, useCallback } from 'react';
import { ProgressService, ProgressEntry } from '@/services/ProgressService';
// Use browser crypto.randomUUID when available to avoid adding the 'uuid' dependency

export const useProgress = () => {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    setEntries(ProgressService.getAll());
  }, []);

  const saveProgress = useCallback(async (payload: {
    submissionId?: string | null;
    title: string;
    description?: string;
    filesSnapshot?: Record<string, any>;
    meta?: Record<string, any>;
  }) => {
    const entry: ProgressEntry = {
      id:
        typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
          ? (crypto as any).randomUUID()
          : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      submissionId: payload.submissionId || null,
      title: payload.title,
      description: payload.description,
      createdAt: Date.now(),
      filesSnapshot: payload.filesSnapshot,
      meta: payload.meta,
    };

    ProgressService.saveLocal(entry);
    setEntries((e) => [entry, ...e]);

    // Try to save to Supabase but do not block
    ProgressService.saveSupabase(entry).catch(() => null);

    return entry;
  }, []);

  const exportAll = useCallback(() => {
    return ProgressService.exportAll();
  }, []);

  return { entries, saveProgress, exportAll };
};
