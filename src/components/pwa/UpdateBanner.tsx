import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { RefreshCw, X } from 'lucide-react';

export function UpdateBanner() {
  const { updateAvailable, reload, dismiss } = useUpdateChecker();

  if (!updateAvailable) return null;

  return (
    <div className="sticky top-13 z-20 flex items-center gap-2 bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
      <RefreshCw className="h-4 w-4 shrink-0" />
      <span className="flex-1">Versi baru tersedia</span>
      <button
        onClick={reload}
        className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold hover:bg-white/30"
      >
        Muat ulang
      </button>
      <button onClick={dismiss} className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/20" aria-label="Tutup">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
