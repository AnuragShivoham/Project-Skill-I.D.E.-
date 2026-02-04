import { supabase } from '@/integrations/supabase/client';

export interface ProgressEntry {
  id: string;
  submissionId?: string | null;
  title: string;
  description?: string;
  createdAt: number;
  filesSnapshot?: Record<string, any>;
  meta?: Record<string, any>;
}

const STORAGE_KEY = 'BODHIT_PROGRESS_ENTRIES';

export const ProgressService = {
  getAll(): ProgressEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ProgressEntry[];
    } catch (err) {
      console.error('ProgressService.getAll parse error', err);
      return [];
    }
  },

  saveLocal(entry: ProgressEntry) {
    const items = this.getAll();
    items.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return entry;
  },

  async saveSupabase(entry: ProgressEntry) {
    // Only attempt if supabase client is configured
    try {
      const { data, error } = await supabase.from('progress_entries').insert({
        id: entry.id,
        submission_id: entry.submissionId,
        title: entry.title,
        description: entry.description,
        created_at: new Date(entry.createdAt).toISOString(),
        files_snapshot: entry.filesSnapshot || {},
        meta: entry.meta || {},
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('ProgressService.saveSupabase error', err);
      return null;
    }
  },

  exportAll(): string {
    return JSON.stringify(this.getAll(), null, 2);
  },

  importAll(jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr) as ProgressEntry[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (err) {
      throw new Error('Invalid JSON');
    }
  },
};
