import React from 'react';
import { useProgress } from '@/hooks/useProgress';
import { Button } from '@/components/ui/button';

const ProgressPage = () => {
  const { entries, exportAll } = useProgress();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Project Progress</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const data = exportAll();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `progress-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Progress
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {entries.length === 0 && <div className="text-sm text-muted-foreground">No progress saved yet.</div>}
        {entries.map((e) => (
          <div key={e.id} className="p-4 border rounded bg-muted/50">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs">{e.submissionId || 'Local'}</div>
            </div>
            {e.description && <div className="mt-2 text-sm">{e.description}</div>}
            {e.filesSnapshot && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs">Files snapshot ({Object.keys(e.filesSnapshot).length})</summary>
                <pre className="text-xs max-h-44 overflow-auto mt-2 bg-black/5 p-2 rounded">{JSON.stringify(e.filesSnapshot, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPage;
