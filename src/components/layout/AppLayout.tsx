import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { FAB } from './FAB';

const pageTitles: Record<string, string> = {
  '/': 'NyatetDuwit',
  '/transactions': 'Transaksi',
  '/insights': 'Analisis',
  '/more': 'Lainnya',
};

const fabRoutes = ['/', '/transactions'];

export function AppLayout() {
  const location = useLocation();
  const [fabSignal, setFabSignal] = useState(0);
  const showFAB = fabRoutes.includes(location.pathname);
  const title = pageTitles[location.pathname] ?? 'NyatetDuwit';

  const handleFabClick = useCallback(() => {
    setFabSignal((n) => n + 1);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white dark:bg-neutral-900">
      <Header title={title} />
      <main className="flex-1 overflow-y-auto pb-20 px-4">
        <Outlet context={{ fabSignal }} />
      </main>
      <FAB onClick={handleFabClick} visible={showFAB} />
      <BottomNav />
    </div>
  );
}
