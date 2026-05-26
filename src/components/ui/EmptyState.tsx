import type { ReactNode } from 'react';
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 text-neutral-200 dark:text-neutral-600">{icon}</div>
      <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
      {description && <p className="mb-4 text-sm text-neutral-500">{description}</p>}
      {action}
    </div>
  );
}
