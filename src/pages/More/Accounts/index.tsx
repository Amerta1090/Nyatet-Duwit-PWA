import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountRepo } from '@/db/repositories/accountRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import type { Account } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useUIStore } from '@/stores/uiStore';
import {
  Wallet, Plus, Pencil, Trash2, Archive, Star,
  ArrowLeft, RefreshCw,
} from 'lucide-react';
import { Skeleton, BottomSheet } from '@/components/ui';
import { cn } from '@/utils/cn';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Tunai (Cash)' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'savings', label: 'Tabungan' },
] as const;

const ACCOUNT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#EF4444', '#14B8A6', '#6366F1', '#84CC16', '#06B6D4',
  '#F97316', '#64748B',
];

const ACCOUNT_ICONS = ['wallet', 'banknote', 'piggybank', 'landmark', 'credit-card', 'smartphone'];

export default function AccountsPage() {
  const navigate = useNavigate();
  const { showToast } = useUIStore();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileResults, setReconcileResults] = useState<{ accountId: string; name: string; expected: number; actual: number; diff: number }[] | null>(null);

  async function loadAccounts() {
    setLoading(true);
    const accs = await accountRepo.getAll();
    setAccounts(accs);
    setLoading(false);
  }

  async function handleReconcile() {
    setReconciling(true);
    const results = await accountRepo.reconcileAll();
    setReconcileResults(results);
    const fixed = results.filter((r) => r.diff !== 0 && r.actual < r.expected);
    if (fixed.length > 0) {
      showToast(
        `${fixed.length} akun diperbaiki: ${fixed.map((r) => `${r.name} (${formatCurrency(r.diff)})`).join(', ')}`,
        'info',
      );
    }
    loadAccounts();
    setReconciling(false);
  }

  useEffect(() => { loadAccounts(); }, []);

  const totalBalance = accounts
    .filter((a) => !a.isArchived)
    .reduce((s, a) => s + a.balance, 0);

  return (
    <div className="py-4">
      <button
        onClick={() => navigate('/more')}
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <div className="mb-6 rounded-2xl bg-primary-600 p-5 text-white">
        <p className="text-sm font-medium text-primary-100">Total Saldo</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(totalBalance)}</h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">
          Daftar Akun ({accounts.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${reconciling ? 'animate-spin' : ''}`} />
            Crosscheck
          </button>
          <button
            onClick={() => { setEditAccount(null); setFormOpen(true); }}
            className="flex items-center gap-1 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} height="72px" />)}
        </div>
      ) : accounts.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">Belum ada akun</p>
      ) : (
        <div className="flex flex-col gap-2">
          {accounts.map((acc) => {
            const Icon = (
              acc.icon === 'wallet' ? Wallet :
              acc.icon === 'banknote' || acc.icon === 'landmark' ? Wallet :
              Wallet
            );
            const typeLabel = ACCOUNT_TYPES.find((t) => t.value === acc.type)?.label ?? acc.type;

            return (
              <div
                key={acc.id}
                className="relative overflow-hidden rounded-xl bg-white dark:bg-neutral-800"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${acc.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: acc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{acc.name}</span>
                      {acc.isPrimary && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          <Star className="h-3 w-3" />
                          Utama
                        </span>
                      )}
                      {acc.isArchived && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400 dark:bg-neutral-700">
                          Arsip
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">{typeLabel}</span>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    acc.balance >= 0 ? 'text-neutral-900 dark:text-neutral-50' : 'text-danger-500',
                  )}>
                    {formatCurrency(acc.balance)}
                  </span>
                </div>

                <div className="flex border-t border-neutral-100 dark:border-neutral-700">
                  {!acc.isPrimary && !acc.isArchived && (
                    <button
                      onClick={async () => {
                        await accountRepo.update(acc.id, { isPrimary: true });
                        showToast(`${acc.name} jadi akun utama`, 'success');
                        loadAccounts();
                      }}
                      className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-medium text-amber-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Utamakan
                    </button>
                  )}
                  <button
                    onClick={() => { setEditAccount(acc); setFormOpen(true); }}
                    className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-medium text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  {!acc.isArchived ? (
                    <button
                      onClick={async () => {
                        await accountRepo.archive(acc.id);
                        showToast(`${acc.name} diarsipkan`, 'info');
                        loadAccounts();
                      }}
                      className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Arsipkan
                    </button>
                  ) : null}
                  <button
                    onClick={async () => {
                      const txs = await transactionRepo.getAll({ accountId: acc.id, limit: 1 });
                      if (txs.length > 0) {
                        setDeleteBlocked(true);
                        setDeleteConfirm(acc);
                      } else {
                        setDeleteConfirm(acc);
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-medium text-danger-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditAccount(null); }}
        editAccount={editAccount}
        onSaved={loadAccounts}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {deleteBlocked ? 'Tidak Bisa Dihapus' : 'Hapus Akun?'}
            </h3>
            {deleteBlocked ? (
              <p className="mt-2 text-sm text-neutral-500">
                Akun "{deleteConfirm.name}" memiliki transaksi dan tidak bisa dihapus. Arsipkan saja.
              </p>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">
                Hapus akun "{deleteConfirm.name}"? Tindakan ini tidak bisa dibatalkan.
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteBlocked(false); }}
                className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
              >
                {deleteBlocked ? 'Tutup' : 'Batal'}
              </button>
              {!deleteBlocked && (
                <button
                  onClick={async () => {
                    await accountRepo.update(deleteConfirm.id, { isArchived: true });
                    showToast(`${deleteConfirm.name} dihapus`, 'info');
                    setDeleteConfirm(null);
                    loadAccounts();
                  }}
                  className="flex-1 rounded-xl bg-danger-500 py-2.5 text-sm font-medium text-white"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomSheet
        open={!!reconcileResults}
        onClose={() => setReconcileResults(null)}
        title="Hasil Crosscheck"
      >
        <div className="flex flex-col gap-3">
          {reconcileResults?.map((r) => {
            const ok = r.diff === 0;
            const fixed = r.actual < r.expected;
            return (
              <div
                key={r.accountId}
                className={cn(
                  'rounded-xl p-3',
                  ok ? 'bg-emerald-50 dark:bg-emerald-500/10' : fixed ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-blue-50 dark:bg-blue-500/10',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{r.name}</span>
                  <span className={cn('text-xs font-medium', ok ? 'text-emerald-600' : fixed ? 'text-amber-600' : 'text-blue-600')}>
                    {ok ? '✓ Sesuai' : fixed ? '✓ Diperbaiki' : 'Selisih (saldo awal?)'}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-neutral-500">
                  <div>
                    <span className="block text-neutral-400">Transaksi</span>
                    {formatCurrency(r.expected)}
                  </div>
                  <div>
                    <span className="block text-neutral-400">Tersimpan</span>
                    {formatCurrency(r.actual)}
                  </div>
                  <div>
                    <span className="block text-neutral-400">Selisih</span>
                    {r.diff >= 0 ? `+${formatCurrency(r.diff)}` : formatCurrency(r.diff)}
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => setReconcileResults(null)}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 text-sm font-semibold text-white"
          >
            Tutup
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  editAccount: Account | null;
  onSaved: () => void;
}

function AccountForm({ open, onClose, editAccount, onSaved }: AccountFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [icon, setIcon] = useState('wallet');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]!);
  const [initialBalance, setInitialBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setIcon(editAccount.icon);
      setColor(editAccount.color);
      setInitialBalance('');
    } else {
      setName('');
      setType('cash');
      setIcon('wallet');
      setColor(ACCOUNT_COLORS[0]!);
      setInitialBalance('');
    }
  }, [editAccount, open]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editAccount) {
        await accountRepo.update(editAccount.id, { name: name.trim(), type, icon, color });
      } else {
        const accs = await accountRepo.getAll();
        await accountRepo.create({
          name: name.trim(),
          type,
          balance: Number(initialBalance) || 0,
          currency: 'IDR',
          icon,
          color,
          isPrimary: accs.length === 0,
          isArchived: false,
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const isValid = name.trim().length > 0;

  return (
    <BottomSheet open={open} onClose={onClose} title={editAccount ? 'Edit Akun' : 'Tambah Akun'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Nama Akun</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: BCA, GoPay, Cash"
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="mb-1 text-xs font-medium text-neutral-500">Tipe Akun</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {!editAccount && (
          <div>
            <label className="mb-1 text-xs font-medium text-neutral-500">Saldo Awal (opsional)</label>
            <input
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              inputMode="numeric"
              className="h-10 w-full rounded-lg border border-neutral-100 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-100"
            />
          </div>
        )}

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Warna</label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'h-8 w-8 rounded-full transition-all',
                  color === c && 'ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-800',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 text-xs font-medium text-neutral-500">Ikon</label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_ICONS.map((ic) => {
              const selected = icon === ic;
              return (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                    selected ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500 dark:bg-primary-500/20' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700',
                  )}
                >
                  <Wallet className="h-5 w-5" />
                </button>
              );
            })}
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
          {saving ? 'Menyimpan...' : editAccount ? 'Simpan Perubahan' : 'Tambah Akun'}
        </button>
      </div>
    </BottomSheet>
  );
}
