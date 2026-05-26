import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  icon, variant = 'ghost', size = 'md', className, ...props
}: IconButtonProps) {
  const sizeMap = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-13 w-13' };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeMap[size],
        variant === 'ghost' && 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
        variant === 'default' && 'bg-primary-600 text-white hover:bg-primary-700',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
