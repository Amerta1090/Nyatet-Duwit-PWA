import { useState, useEffect } from 'react';
import { debtRepo } from '@/db/repositories/debtRepository';
import { DebtForm } from '@/components/finance/DebtForm';
import { EmptyState, BottomSheet } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { vibrate } from '@/utils/haptic';
import { formatCurrency } from '@/utils/format';
import { format, isPast } from 'date-fns';
import { id } from 'date-fns/locale';
import { HandCoins, UserMinus, UserPlus, AlertTriangle, Plus, Wallet } from 'lucide-react';
import type { Debt } from '@/types';
import { cn } from '@/utils/cn';

export default function DebtPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [payDebt, setPayDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const { showToast } = useUIStore();

  async function loadData() {
    const all = await debtRepo.getAll();
    setDebts(all);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const owed = debts.filter((d) => d.type === 'owed').sort((a, b) => b.createdAt - a.createdAt);
  const owing = debts.filter((d) => d.type === 'owing').sort((a, b) => b.createdAt - a.createdAt);
  const totalOwed = owed.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalOwing = owing.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const net = totalOwed - totalOwing;
  const overdueOwed = owed.filter((d) => d.dueDate && isPast(d.dueDate) && d.paidAmount < d.amount);
  const overdueOwing = owing.filter((d) => d.dueDate && isPast(d.dueDate) && d.paidAmount < d.amount);

  function handleEdit(debt: Debt) {
    setEditDebt(debt);
    setFormOpen(true);
  }

  async function handleDelete(debt: Debt) {
    const confirmed = window.confirm(`Hapus ${debt.type === 'owed' ? 'piutang' : 'utang'} dari ${debt.personName}?`);
    if (!confirmed) return;
    await debtRepo.delete(debt.id);
    showToast('Dihapus', 'info');
    loadData();
  }

  function handlePay(debt: Debt) {
    setPayDebt(debt);
    setPayAmount(String(debt.amount - debt.paidAmount));
  }

  async function handleConfirmPay() {
    if (!payDebt) return;
    const payVal = Number(payAmount.replace(/\./g, ''));
    if (payVal <= 0 || payVal > (payDebt.amount - payDebt.paidAmount)) return;
    await debtRepo.update(payDebt.id, {
      paidAmount: payDebt.paidAmount + payVal,
    });
    showToast('Pembayaran dicatat', 'success');
    vibrate(30);
    setPayDebt(null);
    loadData();
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditDebt(null);
    loadData();
  }

  function DebtCard({ debt }: { debt: Debt }) {
    const remaining = debt.amount - debt.paidAmount;
    const overdue = debt.dueDate && isPast(debt.dueDate) && remaining > 0;
    const progressPercent = debt.amount > 0 ? Math.round((debt.paidAmount / debt.amount) * 100) : 0;

    return (
      <div className={cn(
        'rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800',
        overdue && 'border border-danger-200 dark:border-danger-500/30',
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              debt.type === 'owed' ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-amber-50 dark:bg-amber-500/10',
            )}>
              {debt.type === 'owed' ? (
                <UserPlus className="h-5 w-5 text-blue-500" />
              ) : (
                <UserMinus className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">{debt.personName}</p>
              <p className="text-xs text-neutral-400">
                {debt.type === 'owed' ? 'Piutang' : 'Utang'} — {formatCurrency(remaining)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              'text-sm font-bold',
              debt.type === 'owed' ? 'text-blue-500' : 'text-amber-500',
            )}>
              {debt.type === 'owed' ? '+' : '-'}{formatCurrency(remaining)}
            </p>
            {overdue && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-danger-500">
                <AlertTriangle className="h-3 w-3" />
                Terlambat
              </div>
            )}
          </div>
        </div>

        {debt.paidAmount > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Lunas {progressPercent}%</span>
              <span>{formatCurrency(debt.paidAmount)} / {formatCurrency(debt.amount)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {debt.dueDate && (
          <p className="mt-1.5 text-xs text-neutral-400">
            Jatuh tempo: {format(debt.dueDate, 'dd MMM yyyy', { locale: id })}
          </p>
        )}
        {debt.notes && (
          <p className="mt-1 text-xs text-neutral-400">{debt.notes}</p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handlePay(debt)}
            className="flex items-center justify-center gap-1 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600"
          >
            <Wallet className="h-3.5 w-3.5" />
            Bayar
          </button>
          <button
            onClick={() => handleEdit(debt)}
            className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(debt)}
            className="rounded-lg bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-500 transition-colors hover:bg-danger-100 dark:bg-danger-500/10 dark:hover:bg-danger-500/20"
          >
            Hapus
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        {!loading && debts.length > 0 && (
          <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-neutral-400">Piutang</p>
                <p className="text-sm font-bold text-blue-500">{formatCurrency(totalOwed)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Utang</p>
                <p className="text-sm font-bold text-amber-500">{formatCurrency(totalOwing)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Bersih</p>
                <p className={cn('text-sm font-bold', net >= 0 ? 'text-accent-500' : 'text-danger-500')}>
                  {net >= 0 ? '+' : ''}{formatCurrency(net)}
                </p>
              </div>
            </div>
          </div>
        )}

        {overdueOwed.length > 0 && (
          <div className="rounded-xl bg-danger-50 p-3 dark:bg-danger-500/10">
            <p className="text-xs font-medium text-danger-600 dark:text-danger-400">
              {overdueOwed.length} piutang dan {overdueOwing.length} utang lewat jatuh tempo
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-neutral-400">Memuat...</p>
          </div>
        ) : debts.length === 0 ? (
          <EmptyState
            icon={<HandCoins className="h-10 w-10" />}
            title="Belum ada utang/piutang"
            description="Catat uang yang kamu pinjam atau pinjamkan"
            action={
              <button
                onClick={() => { setEditDebt(null); setFormOpen(true); }}
                className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Tambah
              </button>
            }
          />
        ) : (
          <>
            {owed.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Piutang ({formatCurrency(totalOwed)})
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {owed.map((d) => <DebtCard key={d.id} debt={d} />)}
                </div>
              </div>
            )}

            {owing.length > 0 && (
              <div>
                <div className="mb-2 mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Utang ({formatCurrency(totalOwing)})
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {owing.map((d) => <DebtCard key={d.id} debt={d} />)}
                </div>
              </div>
            )}

            <button
              onClick={() => { setEditDebt(null); setFormOpen(true); }}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-400 transition-colors hover:border-primary-500 hover:text-primary-500 dark:border-neutral-600 dark:hover:border-primary-500"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </>
        )}
      </div>

      <DebtForm
        open={formOpen}
        onClose={handleFormClose}
        editDebt={editDebt}
        onSaved={() => {}}
      />

      <BottomSheet
        open={!!payDebt}
        onClose={() => setPayDebt(null)}
        title="Catat Pembayaran"
      >
        <div className="flex flex-col gap-4">
          {payDebt && (
            <>
              <p className="text-sm text-neutral-500">
                {payDebt.type === 'owed' ? 'Menerima pembayaran dari' : 'Membayar kepada'} <strong>{payDebt.personName}</strong>
              </p>
              <p className="text-xs text-neutral-400">
                Sisa: {formatCurrency(payDebt.amount - payDebt.paidAmount)}
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Jumlah bayar"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setPayDebt(null)}
                  className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmPay}
                  className="flex-1 rounded-xl bg-accent-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600"
                >
                  Catat
                </button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
