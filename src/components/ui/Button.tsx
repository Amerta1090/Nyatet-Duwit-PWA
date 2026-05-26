import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-500/50',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100/80 dark:bg-neutral-700 dark:text-neutral-100',
  ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-13 px-6 text-lg',
};

export function Button({
  variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-primary-500',
        'disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
