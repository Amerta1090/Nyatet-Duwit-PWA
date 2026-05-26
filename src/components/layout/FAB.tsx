import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FABProps {
  onClick: () => void;
  visible?: boolean;
}

export function FAB({ onClick, visible = true }: FABProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
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
