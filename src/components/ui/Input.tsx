import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700 dark:text-neutral-100">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-lg border bg-white px-3 text-base text-neutral-900',
          'placeholder:text-neutral-500',
          'focus:outline-2 focus:outline-primary-500',
          'dark:bg-neutral-700 dark:text-neutral-100',
          error
            ? 'border-danger-500 focus:outline-danger-500'
            : 'border-neutral-100 dark:border-neutral-500',
          className,
        )}
        {...props}
      />
      {error && <span className="text-sm text-danger-500">{error}</span>}
      {helperText && !error && <span className="text-sm text-neutral-500">{helperText}</span>}
    </div>
  );
}
