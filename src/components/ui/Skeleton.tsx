import { cn } from '@/utils/cn';

interface SkeletonProps {
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = '16px', lines, className }: SkeletonProps) {
  if (lines) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('animate-pulse rounded bg-neutral-100 dark:bg-neutral-700', className)}
            style={{ width: i === lines - 1 ? '60%' : width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('animate-pulse rounded bg-neutral-100 dark:bg-neutral-700', className)}
      style={{ width, height }}
    />
  );
}
