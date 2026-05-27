import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { X } from 'lucide-react';

export function InstallPrompt() {
  const { show, promptInstall, dismiss } = useInstallPrompt();

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-lg animate-slide-up">
      <div className="rounded-xl bg-primary-600 p-4 text-white shadow-lg dark:bg-primary-700">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold">Pasang NyatetDuwit</p>
            <p className="mt-0.5 text-xs text-primary-100">
              Pasang aplikasi ke layar utama untuk akses lebih cepat.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={promptInstall}
          className="mt-3 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
        >
          Pasang
        </button>
      </div>
    </div>
  );
}
