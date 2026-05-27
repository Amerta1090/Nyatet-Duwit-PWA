import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { useDatabase } from '@/hooks/useDatabase';
import { useDeepLink } from '@/hooks/useDeepLink';
import { InstallPrompt } from '@/components/pwa';
import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { Skeleton, ErrorBoundary } from '@/components/ui';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useAppStore } from '@/stores/appStore';
import type { Transaction } from '@/types';

const HomePage = lazy(() => import('@/pages/Home'));
const TransactionsPage = lazy(() => import('@/pages/Transactions'));
const InsightsPage = lazy(() => import('@/pages/Insights'));
const MorePage = lazy(() => import('@/pages/More'));
const TransactionDetailPage = lazy(() => import('@/pages/Transactions/Detail'));
const AccountsPage = lazy(() => import('@/pages/More/Accounts'));
const CategoriesPage = lazy(() => import('@/pages/More/Categories'));
const BudgetsPage = lazy(() => import('@/pages/More/Budgets'));
const RecurringPage = lazy(() => import('@/pages/More/Recurring'));
const ReconcilePage = lazy(() => import('@/pages/More/Reconcile'));
const SettingsPage = lazy(() => import('@/pages/More/Settings'));
const BackupRestorePage = lazy(() => import('@/pages/More/Backup'));

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
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const darkMode = useAppStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAddTransaction = useCallback(() => {
    setEditTx(null);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setEditTx(null);
  }, []);

  useDeepLink({ onAddTransaction: handleAddTransaction });

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
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:id" element={<TransactionDetailPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="more/accounts" element={<AccountsPage />} />
            <Route path="more/categories" element={<CategoriesPage />} />
            <Route path="more/budgets" element={<BudgetsPage />} />
            <Route path="more/recurring" element={<RecurringPage />} />
            <Route path="more/reconcile" element={<ReconcilePage />} />
            <Route path="more/settings" element={<SettingsPage />} />
            <Route path="more/backup" element={<BackupRestorePage />} />
          </Route>
        </Routes>
      </Suspense>
      <InstallPrompt />
      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        editId={editTx?.id}
        prefill={editTx ? {
          type: editTx.type,
          amount: editTx.amount,
          categoryId: editTx.categoryId,
          accountId: editTx.accountId,
          date: editTx.date,
          notes: editTx.notes,
        } : undefined}
      />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
