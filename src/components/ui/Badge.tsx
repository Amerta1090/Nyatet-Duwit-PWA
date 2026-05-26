import { cn } from '@/utils/cn';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100',
  success: 'bg-accent-50 text-accent-600 dark:bg-accent-500/20 dark:text-accent-500',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500',
  danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/20 dark:text-danger-500',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variantStyles[variant])}>
      {label}
    </span>
  );
}
