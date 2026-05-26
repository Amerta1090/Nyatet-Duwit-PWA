import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { useDatabase } from '@/hooks/useDatabase';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui';

const HomePage = lazy(() => import('@/pages/Home'));
const TransactionsPage = lazy(() => import('@/pages/Transactions'));
const InsightsPage = lazy(() => import('@/pages/Insights'));
const MorePage = lazy(() => import('@/pages/More'));

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Skeleton height="120px" />
      <Skeleton height="60px" lines={3} />
    </div>
  );
}

function AppContent() {
  const { ready, error } = useDatabase();

  if (error) {
    return (
      <div className="flex h-dvh items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-danger-500">Gagal memuat database</h2>
          <p className="text-sm text-neutral-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center p-8">
        <Skeleton height="200px" />
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="more" element={<MorePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
