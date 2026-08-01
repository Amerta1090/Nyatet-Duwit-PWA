import { Download, X } from 'lucide-react';

interface AutoBackupBannerProps {
  onDownload: () => void;
  onClose: () => void;
}

export function AutoBackupBanner({ onDownload, onClose }: AutoBackupBannerProps) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-lg animate-slide-up">
      <div className="rounded-xl bg-neutral-800 p-4 text-white shadow-lg dark:bg-neutral-700">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500">
              <Download className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium">Backup harian siap. Klik untuk mengunduh.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onDownload}
          className="mt-3 w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Unduh Backup
        </button>
      </div>
    </div>
  );
}
