import { useState, useEffect, useCallback } from 'react';
import { emergencyFundRepo } from '@/db/repositories/emergencyFundRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { formatCurrency } from '@/utils/format';
import { Button, BottomSheet } from '@/components/ui';
import { ShieldAlert, ShieldCheck, Lightbulb, Pencil, ChevronRight } from 'lucide-react';
import type { Account } from '@/types';
import { cn } from '@/utils/cn';

type ProgressLevel = 'low' | 'medium' | 'high' | 'complete';

function getProgressLevel(percent: number): ProgressLevel {
  if (percent >= 100) return 'complete';
  if (percent >= 75) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}

const TIPS: Record<ProgressLevel, { title: string; message: string }> = {
  low: {
    title: 'Mulai bangun dana darurat',
    message: 'Targetkan minimal 3x pengeluaran bulanan. Mulai dengan sisihkan sebagian pemasukan setiap bulan.',
  },
  medium: {
    title: 'Setengah jalan!',
    message: 'Kamu sudah mencapai setengah target dana darurat. Tetap konsisten menyisihkan dana.',
  },
  high: {
    title: 'Hampir sampai!',
    message: 'Dana darurat hampir terpenuhi. Idealnya 3-6 bulan pengeluaran untuk perlindungan maksimal.',
  },
  complete: {
    title: 'Dana darurat terpenuhi!',
    message: 'Selamat! Kamu sudah memiliki dana darurat yang cukup. Pertahankan dan pertimbangkan untuk investasi.',
  },
};

export default function EmergencyFundPage() {
  const [progress, setProgress] = useState({ current: 0, target: 0, percent: 0 });
  const [targetMode, setTargetMode] = useState<'auto' | 'manual'>('auto');
  const [recommended, setRecommended] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetSheetOpen, setTargetSheetOpen] = useState(false);
  const [customTarget, setCustomTarget] = useState('');
  const [accountsSheetOpen, setAccountsSheetOpen] = useState(false);

  async function loadData() {
    const [prog, target, rec, accs, ids] = await Promise.all([
      emergencyFundRepo.getProgress(),
      emergencyFundRepo.getTarget(),
      emergencyFundRepo.calculateRecommendedAmount(),
      accountRepo.getAll(true),
      emergencyFundRepo.getLinkedAccountIds(),
    ]);
    setProgress(prog);
    setTargetMode(target.mode);
    setRecommended(rec);
    setAccounts(accs);
    setLinkedIds(ids.length > 0 ? ids : accs.map((a) => a.id));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const level = getProgressLevel(progress.percent);
  const tip = TIPS[level];

  const handleSetTarget = useCallback(async () => {
    const val = customTarget.replace(/\./g, '');
    const num = Number(val);
    if (num > 0) {
      await emergencyFundRepo.setTarget(num);
    } else {
      await emergencyFundRepo.setTarget('auto');
    }
    setTargetSheetOpen(false);
    loadData();
  }, [customTarget]);

  const handleToggleAccount = useCallback(async (accountId: string) => {
    const newIds = linkedIds.includes(accountId)
      ? linkedIds.filter((id) => id !== accountId)
      : [...linkedIds, accountId];
    setLinkedIds(newIds);
    await emergencyFundRepo.setLinkedAccountIds(newIds);
    const prog = await emergencyFundRepo.getProgress();
    setProgress(prog);
  }, [linkedIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-neutral-400">Memuat...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
          <div className="mb-4 flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              level === 'complete' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
              level === 'high' ? 'bg-blue-50 dark:bg-blue-500/10' :
              level === 'medium' ? 'bg-amber-50 dark:bg-amber-500/10' :
              'bg-neutral-50 dark:bg-neutral-700',
            )}>
              {level === 'complete' ? (
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
              ) : (
                <ShieldAlert className={cn(
                  'h-6 w-6',
                  level === 'high' ? 'text-blue-500' :
                  level === 'medium' ? 'text-amber-500' :
                  'text-neutral-400',
                )} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Dana Darurat</h2>
              <p className="text-xs text-neutral-400">Progress {progress.percent}%</p>
            </div>
          </div>

          <div className="mb-2 h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                level === 'complete' ? 'bg-emerald-500' :
                level === 'high' ? 'bg-blue-500' :
                level === 'medium' ? 'bg-amber-500' :
                'bg-neutral-400',
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Terkumpul</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(progress.current)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Target</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(progress.target)}
                </span>
                <button onClick={() => { setCustomTarget(String(progress.target)); setTargetSheetOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Rekomendasi: 3x pengeluaran bulanan</span>
              <span>{formatCurrency(recommended)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{tip.title}</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{tip.message}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Akun Terkait</h3>
            <button
              onClick={() => setAccountsSheetOpen(true)}
              className="flex items-center gap-0.5 text-xs font-medium text-primary-500"
            >
              Atur
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            Saldo dari akun yang dipilih akan dihitung sebagai dana darurat.
            {linkedIds.length === accounts.length && ' (Semua akun)'}
          </p>
        </div>
      </div>

      <BottomSheet open={targetSheetOpen} onClose={() => setTargetSheetOpen(false)} title="Atur Target">
        <div className="flex flex-col gap-4">
          <Button
            variant={targetMode === 'auto' ? 'primary' : 'ghost'}
            onClick={() => { emergencyFundRepo.setTarget('auto'); setTargetSheetOpen(false); loadData(); }}
          >
            Otomatis (3x pengeluaran)
          </Button>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-100">Manual</p>
            <input
              type="number"
              inputMode="numeric"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="Rp 15.000.000"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
            />
            <Button variant="primary" onClick={handleSetTarget}>
              Simpan Target
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={accountsSheetOpen} onClose={() => setAccountsSheetOpen(false)} title="Pilih Akun">
        <div className="flex flex-col gap-2">
          {accounts.map((account) => (
            <label
              key={account.id}
              className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-700"
            >
              <input
                type="checkbox"
                checked={linkedIds.includes(account.id)}
                onChange={() => handleToggleAccount(account.id)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-500"
              />
              <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {account.name}
              </span>
              <span className="text-sm text-neutral-500">{formatCurrency(account.balance)}</span>
            </label>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
