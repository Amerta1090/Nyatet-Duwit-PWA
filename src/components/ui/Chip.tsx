import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  icon?: ReactNode;
  color?: string;
}

export function Chip({ label, selected = false, icon, color, className, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap',
        'transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500',
        selected
          ? 'text-white shadow-sm'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100/80 dark:bg-neutral-700 dark:text-neutral-100',
        className,
      )}
      style={selected && color ? { backgroundColor: color } : undefined}
      {...props}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {label}
    </button>
  );
}
