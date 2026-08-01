import { useRef, useState } from 'react';
import { backupRepo } from '@/db/repositories/backupRepository';
import { resetLastBackupDay } from '@/db/backup';
import { Button } from '@/components/ui';
import { FileUp, Database, Sparkles } from 'lucide-react';

interface RestoreDialogProps {
  onStartFresh: () => Promise<void> | void;
}

export function RestoreDialog({ onStartFresh }: RestoreDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await backupRepo.importData(data);
      if (result.success) {
        resetLastBackupDay();
        window.location.reload();
        return;
      }
      setErrorMsg(result.error || 'File tidak valid');
    } catch {
      setErrorMsg('File backup tidak valid. Pastikan memilih file backup NyatetDuwit.');
    }
    setBusy(false);
  }

  return (
    <div className="flex h-dvh items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-800">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-900/20">
          <Database className="h-7 w-7 text-danger-500" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Data lokal tidak ditemukan
        </h2>
        <p className="mt-1 mb-5 text-sm text-neutral-500 dark:text-neutral-400">
          Pulihkan dari file backup?
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col gap-3">
          <Button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full">
            <FileUp className="h-4 w-4" />
            {busy ? 'Memulihkan...' : 'Pulihkan dari Backup'}
          </Button>
          <Button variant="secondary" onClick={() => void onStartFresh()} disabled={busy} className="w-full">
            <Sparkles className="h-4 w-4" />
            Mulai Baru
          </Button>
        </div>

        {errorMsg && <p className="mt-3 text-sm font-medium text-danger-500">{errorMsg}</p>}
      </div>
    </div>
  );
}
