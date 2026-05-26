import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { accountRepo } from '@/db/repositories/accountRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import type { Account, Transaction, Category } from '@/types';
import { formatCurrency } from '@/utils/format';
import { ArrowLeftRight } from 'lucide-react';
import { EmptyState, Skeleton } from '@/components/ui';
import { TransactionItem } from '@/components/finance/TransactionItem';
import { useUIStore } from '@/stores/uiStore';

export default function HomePage() {
  const { fabSignal } = useOutletContext<{ fabSignal: number }>();
  const { showToast } = useUIStore();

  const [formOpen, setFormOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [balance, txs, cats, accs] = await Promise.all([
      accountRepo.getTotalBalance(),
      transactionRepo.getAll({ limit: 10 }),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]);
    setTotalBalance(balance);
    setRecentTxs(txs);
    setCategories(cats);
    setAccounts(accs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (fabSignal > 0) setFormOpen(true);
  }, [fabSignal]);

  async function handleDelete(tx: Transaction) {
    await transactionRepo.delete(tx.id);
    showToast('Transaksi dihapus', 'info', async () => {
      const input = {
        type: tx.type, amount: tx.amount, categoryId: tx.categoryId,
        accountId: tx.accountId, toAccountId: tx.toAccountId,
        date: tx.date, notes: tx.notes,
      };
      await transactionRepo.create(input);
      showToast('Transaksi dipulihkan', 'success');
      loadData();
    });
    loadData();
  }

  function handleEdit() {
    setFormOpen(true);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="rounded-2xl bg-primary-600 p-6 text-white">
        <p className="text-sm font-medium text-primary-100">Total Saldo</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {loading ? <Skeleton height="36px" className="bg-white/20" /> : formatCurrency(totalBalance)}
        </h2>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          Transaksi Terakhir
        </h3>
        {loading ? (
          <Skeleton height="60px" lines={4} />
        ) : recentTxs.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="h-10 w-10" />}
            title="Belum ada transaksi"
            description="Tap + untuk mencatat transaksi pertama"
          />
        ) : (
          <div className="flex flex-col gap-1">
            {recentTxs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={categoryMap[tx.categoryId]}
                account={accountMap[tx.accountId]}
                toAccount={tx.toAccountId ? accountMap[tx.toAccountId] : undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); loadData(); }}
      />
    </div>
  );
}
