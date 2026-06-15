import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { Modal } from '@/components/ui/Modal';
import { Sparkles } from 'lucide-react';

export function WhatsNewModal() {
  const { showWhatsNew, whatsNewContent, dismissWhatsNew } = useUpdateChecker();

  if (!showWhatsNew || !whatsNewContent) return null;

  return (
    <Modal open={showWhatsNew} onClose={dismissWhatsNew} title="Apa yang Baru">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-primary-500">
          <Sparkles className="h-4 w-4" />
          Fitur terbaru
        </div>
        <div className="max-h-60 overflow-y-auto text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {whatsNewContent.split('\n').map((line, i) => (
            <div key={i} className="mb-1">{line}</div>
          ))}
        </div>
        <button
          onClick={dismissWhatsNew}
          className="mt-2 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Mulai
        </button>
      </div>
    </Modal>
  );
}
