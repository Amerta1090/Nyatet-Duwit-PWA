import { type ReactNode, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 transition-opacity duration-200" onClick={onClose} />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-10',
          'rounded-t-2xl bg-white p-6 shadow-lg',
          'dark:bg-neutral-900',
          'animate-slide-up transition-transform duration-200 ease-out',
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-600" />
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
