import { useEffect, useState, useRef } from 'react';
import { recurringRepo, type RecurringInput } from '@/db/repositories/recurringRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import type { RecurringTransaction, Category, Account } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { getCategoryIcon } from '@/utils/icons';
import { useUIStore } from '@/stores/uiStore';
import { EmptyState, BottomSheet, Badge } from '@/components/ui';
import { ArrowLeftRight, Plus, Play, Pause, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { startOfDay } from '@/utils/date';

const frequencies = [
  { value: 'daily' as const, label: 'Setiap Hari' },
  { value: 'weekly' as const, label: 'Setiap Minggu' },
  { value: 'monthly' as const, label: 'Setiap Bulan' },
  { value: 'yearly' as const, label: 'Setiap Tahun' },
];

export default function RecurringPage() {
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useUIStore();

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(() => startOfDay(Date.now()));
  const [endDate, setEndDate] = useState<number | undefined>();
  const [isActive, setIsActive] = useState(true);

  const initializedRef = useRef(false);

  async function loadData() {
    setLoading(true);
    const [r, cats, accs] = await Promise.all([
      recurringRepo.getAll(),
      categoryRepo.getAll(),
      accountRepo.getAll(true),
    ]);
    setRecurrings(r);
    setCategories(cats);
    setAccounts(accs);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.type === type || (c.type === 'expense' && type === 'transfer'),
  );

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  function resetForm() {
    setType('expense');
    setAmount('');
    setCategoryId(filteredCategories[0]?.id ?? '');
    setAccountId(activeAccounts[0]?.id ?? '');
    setToAccountId('');
    setFrequency('monthly');
    setStartDate(startOfDay(Date.now()));
    setEndDate(undefined);
    setIsActive(true);
    setEditId(null);
  }

  function openAddForm() {
    resetForm();
    initializedRef.current = true;
    setFormOpen(true);
  }

  function openEditForm(rec: RecurringTransaction) {
    setEditId(rec.id);
    setType(rec.template.type);
    setAmount(String(rec.template.amount));
    setCategoryId(rec.template.categoryId);
    setAccountId(rec.template.accountId);
    setToAccountId(rec.template.toAccountId ?? '');
    setFrequency(rec.frequency);
    setStartDate(rec.startDate);
    setEndDate(rec.endDate);
    setIsActive(rec.isActive);
    initializedRef.current = true;
    setFormOpen(true);
  }

  const isValid = amount && Number(amount) > 0 && categoryId && accountId;

  async function handleSave() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const input: RecurringInput = {
        template: {
          type,
          amount: Number(amount),
          categoryId,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId || undefined : undefined,
          notes: '',
        },
        frequency,
        startDate,
        endDate: endDate || undefined,
        isActive,
      };

      if (editId) {
        const existing = await recurringRepo.getById(editId);
        if (existing) {
          existing.template = input.template;
          existing.frequency = input.frequency;
          existing.startDate = input.startDate;
          existing.endDate = input.endDate;
          existing.isActive = input.isActive;
          await recurringRepo.update(editId, existing);
        }
      } else {
        await recurringRepo.create(input);
      }

      showToast(editId ? 'Transaksi berulang diperbarui' : 'Transaksi berulang tersimpan', 'success');
      setFormOpen(false);
      loadData();
    } catch {
      showToast('Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(rec: RecurringTransaction) {
    await recurringRepo.update(rec.id, { isActive: !rec.isActive });
    showToast(rec.isActive ? 'Transaksi dijeda' : 'Transaksi dilanjutkan', 'info');
    loadData();
  }

  async function handleDelete(rec: RecurringTransaction) {
    await recurringRepo.delete(rec.id);
    showToast('Transaksi berulang dihapus', 'info');
    loadData();
  }

  function getNextDue(rec: RecurringTransaction): string {
    if (!rec.isActive) return '—';
    const last = rec.lastGenerated ?? rec.startDate;
    const next = new Date(last).getTime() + (rec.frequency === 'daily' ? 86400000 : rec.frequency === 'weekly' ? 604800000 : rec.frequency === 'monthly' ? 2592000000 : 31536000000);
    if (rec.endDate && next > rec.endDate) return 'Berakhir';
    return formatDate(next, 'dd MMM yyyy');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-neutral-400">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
        {recurrings.length} transaksi berulang aktif
      </p>

      {recurrings.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-12 w-12" />}
          title="Belum ada transaksi berulang"
          description="Buat transaksi otomatis untuk biaya rutin seperti kost, langganan, atau gaji"
          action={<button onClick={openAddForm} className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Tambah Transaksi Berulang</button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {recurrings.map((rec) => {
            const cat = categories.find((c) => c.id === rec.template.categoryId);
            const acc = accounts.find((a) => a.id === rec.template.accountId);
            const Icon = cat ? getCategoryIcon(cat.icon) : ArrowLeftRight;
            return (
              <div key={rec.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: cat?.color ? cat.color + '20' : undefined }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat?.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                      {formatCurrency(rec.template.amount)}
                    </span>
                    <Badge
                      label={frequencies.find((f) => f.value === rec.frequency)?.label ?? rec.frequency}
                      variant="default"
                    />
                    {rec.isActive ? (
                      <Badge label="Aktif" variant="success" />
                    ) : (
                      <Badge label="Dijeda" variant="warning" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                    <span>{cat?.name ?? 'Tanpa kategori'}</span>
                    <span>·</span>
                    <span>{acc?.name ?? 'Tanpa akun'}</span>
                    <span>·</span>
                    <span>Berikutnya: {getNextDue(rec)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(rec)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    {rec.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(rec)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={openAddForm}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <Plus className="h-5 w-5" />
        Tambah Transaksi Berulang
      </button>

      <BottomSheet open={formOpen} onClose={() => { setFormOpen(false); resetForm(); }} title={editId ? 'Edit Transaksi Berulang' : 'Transaksi Berulang Baru'}>
        <div className="flex flex-col gap-4">
          <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setToAccountId(''); }}
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

          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Jumlah (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm placeholder:text-neutral-300 focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="">Pilih kategori</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id!}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Akun</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="">Pilih akun</option>
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div>
              <label className="mb-1 text-xs font-medium text-neutral-500">Ke Akun</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
              >
                <option value="">Pilih akun tujuan</option>
                {activeAccounts.filter((a) => a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Frekuensi</label>
            <div className="flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
              {frequencies.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                    frequency === f.value
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-600 dark:text-neutral-50'
                      : 'text-neutral-500',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

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
    </div>
  );
}