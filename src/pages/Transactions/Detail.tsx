import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { useUIStore } from '@/stores/uiStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { getCategoryIcon } from '@/utils/icons';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { Skeleton, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { createElement } from 'react';
import type { Transaction, Category, Account } from '@/types';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [category, setCategory] = useState<Category | undefined>();
  const [account, setAccount] = useState<Account | undefined>();
  const [toAccount, setToAccount] = useState<Account | undefined>();
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      transactionRepo.getById(id),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]).then(([txData, cats, accs]) => {
      if (!txData) { setLoading(false); return; }
      setTx(txData);
      setCategory(cats.find((c) => c.id === txData.categoryId));
      setAccount(accs.find((a) => a.id === txData.accountId));
      setToAccount(txData.toAccountId ? accs.find((a) => a.id === txData.toAccountId) : undefined);
      setLoading(false);
    });
  }, [id]);

  function requestDelete() {
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!tx) return;
    setShowDeleteConfirm(false);
    await transactionRepo.delete(tx.id);
    showToast('Transaksi dihapus', 'info');
    navigate('/transactions');
  }

  if (loading) {
    return (
      <div className="py-4">
        <Skeleton height="200px" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-neutral-500">Transaksi tidak ditemukan</p>
        <button onClick={() => navigate('/transactions')} className="text-sm font-medium text-primary-500">
          Kembali ke daftar transaksi
        </button>
      </div>
    );
  }

  const iconElement = category
    ? createElement(getCategoryIcon(category.icon), { className: 'h-8 w-8', style: { color: category.color } })
    : null;

  const amountColor = tx.type === 'income'
    ? 'text-accent-500'
    : tx.type === 'expense'
      ? 'text-danger-500'
      : 'text-primary-500';

  const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';

  return (
    <div className="py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <div className="flex flex-col items-center py-6">
        {iconElement && (
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
          >
            {iconElement}
          </div>
        )}
        <h1 className={cn('text-4xl font-bold', amountColor)}>
          {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
        </h1>
        <p className="mt-1 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          {category?.name ?? typeLabel}
        </p>
        <span className={cn(
          'mt-2 rounded-full px-3 py-0.5 text-xs font-medium',
          tx.type === 'income' ? 'bg-accent-50 text-accent-600' :
          tx.type === 'expense' ? 'bg-danger-50 text-danger-600' :
          'bg-primary-50 text-primary-600',
        )}>
          {typeLabel}
        </span>
      </div>

      <div className="mt-6 space-y-3 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
        <div className="flex justify-between">
          <span className="text-sm text-neutral-500">Tanggal</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            {formatDate(tx.date, 'dd MMM yyyy HH:mm')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-500">Akun</span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            {account?.name ?? 'Tidak diketahui'}
          </span>
        </div>
        {tx.type === 'transfer' && toAccount && (
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Tujuan</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {toAccount.name}
            </span>
          </div>
        )}
        {tx.notes && (
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Catatan</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{tx.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => setFormOpen(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-base font-semibold text-white"
        >
          <Pencil className="h-4 w-4" />
          Edit Transaksi
        </button>
        <button
          onClick={requestDelete}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-danger-200 text-base font-semibold text-danger-500 dark:border-danger-500/30"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Transaksi
        </button>
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); navigate('/transactions'); }}
        editId={tx.id}
        prefill={{
          type: tx.type,
          amount: tx.amount,
          categoryId: tx.categoryId,
          accountId: tx.accountId,
          date: tx.date,
          notes: tx.notes,
        }}
      />

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Hapus Transaksi">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Yakin ingin menghapus transaksi ini?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-300"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 rounded-xl bg-danger-500 py-2.5 text-sm font-medium text-white"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
