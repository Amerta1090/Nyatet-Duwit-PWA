import { useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FABProps {
  onClick: () => void;
  onDoubleClick?: () => void;
  visible?: boolean;
}

export function FAB({ onClick, onDoubleClick, visible = true }: FABProps) {
  const lastTap = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (onDoubleClick && now - lastTap.current < 300) {
      onDoubleClick();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      onClick();
    }
  }, [onClick, onDoubleClick]);

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center',
        'rounded-full bg-primary-600 text-white shadow-lg',
        'transition-transform duration-200 active:scale-95',
        'hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-primary-500',
      )}
      aria-label="Tambah transaksi"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
