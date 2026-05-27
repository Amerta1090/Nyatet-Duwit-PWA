import { useState } from 'react';
import { accountRepo } from '@/db/repositories/accountRepository';
import { formatCurrency } from '@/utils/format';
import { Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export default function ReconcilePage() {
  const { showToast } = useUIStore();
  const [results, setResults] = useState<{ accountId: string; name: string; expected: number; actual: number; diff: number }[] | null>(null);
  const [running, setRunning] = useState(false);

  async function handleReconcile() {
    setRunning(true);
    try {
      const res = await accountRepo.reconcileAll();
      setResults(res);
      const fixed = res.filter((r) => r.diff !== 0).length;
      if (fixed > 0) {
        showToast(`${fixed} akun disesuaikan`, 'success');
      } else {
        showToast('Semua saldo sudah akurat', 'info');
      }
    } catch {
      showToast('Gagal melakukan reconcile', 'error');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="rounded-xl bg-cyan-50 p-4 dark:bg-cyan-500/10">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-cyan-500" />
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Reconcile Saldo</h2>
            <p className="text-xs text-neutral-500">Hitung ulang saldo semua akun berdasarkan transaksi</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleReconcile}
        disabled={running}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-cyan-600 text-base font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
      >
        {running ? 'Menghitung...' : 'Jalankan Reconcile'}
      </button>

      {results && (
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <div key={r.accountId} className="flex items-center gap-3 rounded-xl bg-white p-4 dark:bg-neutral-800">
              <div>
                {r.diff === 0 ? (
                  <CheckCircle className="h-5 w-5 text-accent-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{r.name}</p>
                <p className="text-xs text-neutral-400">
                  Diharapkan: {formatCurrency(r.expected)} | Aktual: {formatCurrency(r.actual)}
                </p>
              </div>
              {r.diff !== 0 && (
                <span className="text-xs font-medium text-amber-600">Disesuaikan</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
