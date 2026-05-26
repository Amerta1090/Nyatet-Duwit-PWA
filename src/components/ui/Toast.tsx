import { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  undo?: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-accent-500',
  error: 'bg-danger-500',
  info: 'bg-primary-600',
};

export function Toast({ message, type = 'info', duration = 3000, onClose, undo }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg',
        colors[type],
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-white" />
      <span className="flex-1 text-sm font-medium text-white">{message}</span>
      {undo && (
        <button
          onClick={undo}
          className="text-sm font-semibold text-white underline"
        >
          Batal
        </button>
      )}
      <button onClick={onClose} className="rounded-full p-0.5 hover:bg-white/20">
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
