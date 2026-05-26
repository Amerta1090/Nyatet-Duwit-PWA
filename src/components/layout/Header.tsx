import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-2 bg-white px-4 dark:bg-neutral-900">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className={cn('flex-1 text-lg font-semibold', !showBack && 'text-center')}>
        {title}
      </h1>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
