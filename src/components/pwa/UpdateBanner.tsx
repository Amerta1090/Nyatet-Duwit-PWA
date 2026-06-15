import { useState } from 'react';
import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { RefreshCw, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export function UpdateBanner() {
  const { updateAvailable, latestVersion, reload, dismiss } = useUpdateChecker();
  const [showDetails, setShowDetails] = useState(false);

  if (!updateAvailable) return null;

  const isForceUpdate = latestVersion?.forceUpdate === true;

  return (
    <>
      <div className={`sticky top-13 z-20 flex flex-col ${isForceUpdate ? 'bg-danger-500' : 'bg-emerald-500'}`}>
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white">
          {isForceUpdate && <AlertTriangle className="h-4 w-4 shrink-0" />}
          <RefreshCw className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {isForceUpdate
              ? 'Update wajib tersedia'
              : `Versi ${latestVersion?.version ?? 'baru'} tersedia`}
          </span>
          <button
            onClick={reload}
            className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold hover:bg-white/30"
          >
            Muat ulang
          </button>
          {!isForceUpdate && (
            <button onClick={dismiss} className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/20" aria-label="Tutup">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {latestVersion?.changelog && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-1 bg-black/10 px-4 py-1 text-[11px] text-white/80"
          >
            {showDetails ? 'Tutup' : 'Lihat'} perubahan
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
        {showDetails && latestVersion?.changelog && (
          <div className="bg-black/5 px-4 py-2 text-[11px] leading-relaxed text-white/90">
            {latestVersion.changelog.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
