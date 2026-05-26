import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { FAB } from './FAB';

const pageTitles: Record<string, string> = {
  '/': 'NyatetDuwit',
  '/transactions': 'Transaksi',
  '/transactions/': 'Detail Transaksi',
  '/insights': 'Analisis',
  '/more': 'Lainnya',
};

const fabRoutes = ['/', '/transactions'];

export function AppLayout() {
  const location = useLocation();
  const [fabSignal, setFabSignal] = useState(0);
  const [doubleTapSignal, setDoubleTapSignal] = useState(0);
  const showFAB = fabRoutes.includes(location.pathname);
  const title = pageTitles[location.pathname] ?? (location.pathname.startsWith('/transactions/') ? 'Detail Transaksi' : 'NyatetDuwit');

  const handleFabClick = useCallback(() => {
    setFabSignal((n) => n + 1);
  }, []);

  const handleFabDoubleClick = useCallback(() => {
    setDoubleTapSignal((n) => n + 1);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white dark:bg-neutral-900">
      <Header title={title} />
      <main className="flex-1 overflow-y-auto pb-20 px-4">
        <Outlet context={{ fabSignal, doubleTapSignal }} />
      </main>
      <FAB onClick={handleFabClick} onDoubleClick={handleFabDoubleClick} visible={showFAB} />
      <BottomNav />
    </div>
  );
}
