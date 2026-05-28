import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Transaction, Category, Account } from '@/types';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { TransactionList } from '@/components/finance/TransactionList';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { FilterModal } from '@/components/finance/FilterModal';
import { SearchBar } from '@/components/finance/SearchBar';
import { useUIStore } from '@/stores/uiStore';
import { useFilterStore } from '@/stores/filterStore';
import { startOfDay, getMonthRange } from '@/utils/date';
import { SlidersHorizontal, ArrowUpDown, Search } from 'lucide-react';
import { Badge, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { fabSignal, doubleTapSignal } = useOutletContext<{ fabSignal: number; doubleTapSignal: number }>();
  const { showToast } = useUIStore();
  const filter = useFilterStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [confirmDeleteTx, setConfirmDeleteTx] = useState<Transaction | null>(null);

  function buildQueryOptions() {
    let dateFrom = filter.dateFrom;
    let dateTo = filter.dateTo;
    if (!dateFrom || !dateTo) {
      const now = Date.now();
      switch (filter.datePreset) {
        case 'today': {
          const s = startOfDay(now);
          dateFrom = s; dateTo = s + 86400000;
          break;
        }
        case 'week': {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const monday = startOfDay(today.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000);
          dateFrom = monday; dateTo = startOfDay(now) + 86400000;
          break;
        }
        case 'month': {
          const r = getMonthRange(now);
          dateFrom = r.start; dateTo = r.end;
          break;
        }
        default: {
          dateFrom = 0; dateTo = Date.now() + 86400000;
        }
      }
    }
    return {
      dateFrom, dateTo,
      type: filter.type !== 'all' ? filter.type : undefined,
      categoryId: filter.categoryId,
      accountId: filter.accountId,
      limit: 200,
    };
  }

  async function loadData() {
    setLoading(true);
    const opts = buildQueryOptions();
    const [txs, cats, accs] = await Promise.all([
      transactionRepo.getAll(opts),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]);

    const sorted = [...txs];
    sorted.sort((a, b) => {
      let cmp: number;
      if (filter.sortField === 'amount') {
        cmp = filter.sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      } else {
        cmp = filter.sortDir === 'desc' ? b.date - a.date : a.date - b.date;
      }
      if (cmp !== 0) return cmp;
      const aOrder = a.sortOrder ?? a.createdAt;
      const bOrder = b.sortOrder ?? b.createdAt;
      return bOrder - aOrder;
    });

    setTransactions(sorted);
    setCategories(cats);
    setAccounts(accs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [filter.datePreset, filter.dateFrom, filter.dateTo, filter.type, filter.categoryId, filter.accountId, filter.sortField, filter.sortDir]);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await transactionRepo.search(query, categories.map((c) => ({ id: c.id, name: c.name })));
    setSearchResults(results);
  }

  useEffect(() => {
    if (fabSignal > 0) setFormOpen(true);
  }, [fabSignal]);

  useEffect(() => {
    if (doubleTapSignal > 0) {
      setFormOpen(true);
    }
  }, [doubleTapSignal]);

  function requestDelete(tx: Transaction) {
    setConfirmDeleteTx(tx);
  }

  async function confirmDelete() {
    const tx = confirmDeleteTx;
    if (!tx) return;
    setConfirmDeleteTx(null);
    await transactionRepo.delete(tx.id);
    showToast('Transaksi dihapus', 'info', async () => {
      await transactionRepo.create({
        type: tx.type,
        amount: tx.amount,
        categoryId: tx.categoryId,
        accountId: tx.accountId,
        toAccountId: tx.toAccountId,
        date: tx.date,
        notes: tx.notes,
      });
      showToast('Transaksi dipulihkan', 'success');
      loadData();
    });
    loadData();
  }

  function cancelDelete() {
    setConfirmDeleteTx(null);
  }

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTx(null);
    loadData();
  }

  function handleRowClick(tx: Transaction) {
    navigate(`/transactions/${tx.id}`);
  }

  const filterCount = filter.activeFilterCount();

  const displayedTransactions = searchResults ?? transactions;

  return (
    <div>
      <div className="flex items-center gap-2 py-2">
        <button
          onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults(null); }}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
            showSearch ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100',
          )}
        >
          <Search className="h-4 w-4" />
          Cari
        </button>

        <button
          onClick={() => filter.setShowFilterModal(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
            filterCount > 0
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {filterCount > 0 && <Badge label={String(filterCount)} variant="default" />}
        </button>

        <button
          onClick={filter.toggleSortDir}
          className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100"
        >
          <ArrowUpDown className="h-4 w-4" />
          {filter.sortDir === 'desc' ? 'Terbaru' : 'Terlama'}
        </button>

        <select
          value={filter.sortField}
          onChange={(e) => filter.setSortField(e.target.value as 'date' | 'amount')}
          className="h-8 rounded-lg border border-neutral-100 bg-white px-2 text-xs dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
        >
          <option value="date">Tanggal</option>
          <option value="amount">Jumlah</option>
        </select>
      </div>

      {showSearch && (
        <div className="mb-3">
          <SearchBar onSearch={handleSearch} />
          {searchQuery && searchResults && searchResults.length === 0 && (
            <p className="mt-2 text-center text-sm text-neutral-400">
              Tidak ditemukan untuk "{searchQuery}"
            </p>
          )}
          {searchQuery && searchResults && searchResults.length > 0 && (
            <p className="mt-1 text-xs text-neutral-400">{searchResults.length} hasil untuk "{searchQuery}"</p>
          )}
        </div>
      )}

      <TransactionList
        transactions={displayedTransactions}
        categories={categories}
        accounts={accounts}
        loading={loading && !searchQuery}
        onEdit={handleEdit}
        onDelete={requestDelete}
        onRowClick={handleRowClick}
      />

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

      <FilterModal />

      <Modal open={confirmDeleteTx !== null} onClose={cancelDelete} title="Hapus Transaksi">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Yakin ingin menghapus transaksi ini? Tindakan ini dapat dibatalkan nanti.
        </p>
        {confirmDeleteTx && (
          <div className="mt-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold',
                confirmDeleteTx.type === 'income' ? 'text-accent-500' :
                confirmDeleteTx.type === 'expense' ? 'text-danger-500' : 'text-primary-500',
              )}>
                {confirmDeleteTx.type === 'expense' ? '-' : '+'}{formatCurrency(confirmDeleteTx.amount)}
              </span>
              <span className="text-xs text-neutral-400">{confirmDeleteTx.notes || ''}</span>
            </div>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={cancelDelete}
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
