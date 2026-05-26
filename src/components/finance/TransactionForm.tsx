import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useUIStore } from '@/stores/uiStore';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import type { Category, Account } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { vibrate } from '@/utils/haptic';
import { getCategoryIcon } from '@/utils/icons';
import { startOfDay } from '@/utils/date';
import { cn } from '@/utils/cn';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  editId?: string | null;
  prefill?: {
    type?: 'income' | 'expense' | 'transfer';
    amount?: number;
    categoryId?: string;
    accountId?: string;
    date?: number;
    notes?: string;
  };
}

export function TransactionForm({ open, onClose, editId, prefill }: TransactionFormProps) {
  const { lastUsedCategoryId, lastUsedAccountId, lastTransactionType, updateLastUsed } = useAppStore();
  const { showToast } = useUIStore();

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(() => startOfDay(Date.now()));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const amountRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type || (c.type === 'expense' && type === 'transfer')),
    [categories, type],
  );

  const activeAccounts = useMemo(() => accounts.filter((a) => !a.isArchived), [accounts]);

  const sourceAccount = useMemo(
    () => activeAccounts.find((a) => a.id === accountId),
    [activeAccounts, accountId],
  );

  const isValid = amount.trim().length > 0 && Number(amount) > 0 && categoryId !== null && accountId !== null
    && (type !== 'transfer' || toAccountId !== null);

  const transferInsufficient = type === 'transfer' && sourceAccount && Number(amount) > sourceAccount.balance && !editId;

  const initializeForm = useCallback(() => {
    if (prefill) {
      setType(prefill.type ?? 'expense');
      setAmount(prefill.amount ? String(prefill.amount) : '');
      setCategoryId(prefill.categoryId ?? null);
      setAccountId(prefill.accountId ?? null);
      setDate(prefill.date ?? startOfDay(Date.now()));
      setNotes(prefill.notes ?? '');
    } else {
      setType(lastTransactionType);
      setAmount('');
      setCategoryId(lastUsedCategoryId);
      setAccountId(lastUsedAccountId);
      setDate(startOfDay(Date.now()));
      setNotes('');
      setToAccountId(null);
    }
  }, [prefill, lastTransactionType, lastUsedCategoryId, lastUsedAccountId]);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    categoryRepo.getAll().then(setCategories);
    accountRepo.getAll(true).then(setAccounts);

    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeForm();
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, [open, initializeForm]);

  async function handleSave() {
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const transaction = await transactionRepo.create({
        type,
        amount: Number(amount),
        categoryId: categoryId!,
        accountId: accountId!,
        toAccountId: type === 'transfer' ? toAccountId ?? undefined : undefined,
        date,
        notes: notes || undefined,
      });

      updateLastUsed(categoryId!, accountId!, type);
      vibrate(10);

      showToast('Transaksi tersimpan', 'success', async () => {
        await transactionRepo.delete(transaction.id);
        showToast('Transaksi dibatalkan', 'info');
      });

      onClose();
    } catch {
      showToast('Gagal menyimpan transaksi', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleCategorySelect(id: string) {
    setCategoryId(id === categoryId ? null : id);
  }

  function changeDate(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(startOfDay(d.getTime()));
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editId ? 'Edit Transaksi' : 'Transaksi Baru'}>
      <div className="flex flex-col gap-4">
        <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                if (t !== 'transfer') setToAccountId(null);
              }}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                type === t
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-600 dark:text-neutral-50'
                  : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-neutral-500">Rp</span>
            <input
              ref={amountRef}
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setAmount(raw);
              }}
              placeholder="0"
              className="h-14 w-full rounded-xl border border-neutral-100 bg-white pl-10 pr-4 text-2xl font-bold text-neutral-900 placeholder:text-neutral-200 focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-50"
            />
          </div>
        </div>

        {amount && (
          <div className="-mt-2 text-right text-xs text-neutral-400">
            {formatCurrency(Number(amount))}
          </div>
        )}

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Kategori</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const selected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
                    selected ? 'text-white shadow-sm' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100/80 dark:bg-neutral-700 dark:text-neutral-100',
                  )}
                  style={selected ? { backgroundColor: cat.color } : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 text-xs font-medium text-neutral-500">Akun</label>
            <select
              value={accountId ?? ''}
              onChange={(e) => setAccountId(e.target.value || null)}
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="" disabled>Pilih akun</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div className="flex-1">
              <label className="mb-1 text-xs font-medium text-neutral-500">Ke Akun</label>
              <select
                value={toAccountId ?? ''}
                onChange={(e) => setToAccountId(e.target.value || null)}
                className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="" disabled>Pilih akun</option>
                {activeAccounts.filter((a) => a.id !== accountId).map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Tanggal</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              ← Kemarin
            </button>
            <span className="flex-1 text-center text-sm font-medium">{formatDate(date, 'dd MMM yyyy')}</span>
            <button
              onClick={() => changeDate(1)}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Besok →
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Catatan (opsional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Makan siang di kantin"
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm placeholder:text-neutral-300 focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        {transferInsufficient && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Saldo {sourceAccount?.name} tidak mencukupi (Rp {Number(amount).toLocaleString('id-ID')} &gt; Rp {sourceAccount?.balance.toLocaleString('id-ID')})
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold transition-all',
            isValid && !saving
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-neutral-100 text-neutral-300 dark:bg-neutral-700 dark:text-neutral-500',
          )}
        >
          {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan'}
        </button>
      </div>
    </BottomSheet>
  );
}
