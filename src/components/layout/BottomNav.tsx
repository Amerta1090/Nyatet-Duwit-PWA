import { NavLink } from 'react-router-dom';
import { Home, ArrowLeftRight, BarChart3, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/insights', label: 'Analisis', icon: BarChart3 },
  { to: '/more', label: 'Lainnya', icon: MoreHorizontal },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-100 bg-white px-2 pb-safe dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 min-w-16',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-100',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
