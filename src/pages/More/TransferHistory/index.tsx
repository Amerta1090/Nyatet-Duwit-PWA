import { useState, useEffect, useMemo } from 'react';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { accountRepo } from '@/db/repositories/accountRepository';
import { EmptyState } from '@/components/ui';
import { formatCurrency, formatDate, formatDateRelative } from '@/utils/format';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeftRight, ArrowRight, Filter, X } from 'lucide-react';
import type { Transaction, Account } from '@/types';

type DatePreset = 'all' | 'month' | 'week' | 'custom';

export default function TransferHistoryPage() {
  const [transfers, setTransfers] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [filterAccountId, setFilterAccountId] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    accountRepo.getAll().then(setAccounts);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let dateFrom: number | undefined;
      let dateTo: number | undefined;
      const now = Date.now();

      if (datePreset === 'month') {
        dateFrom = startOfMonth(now).getTime();
        dateTo = endOfMonth(now).getTime();
      } else if (datePreset === 'week') {
        dateFrom = startOfWeek(now, { weekStartsOn: 1 }).getTime();
        dateTo = endOfWeek(now, { weekStartsOn: 1 }).getTime();
      } else if (datePreset === 'custom' && customFrom && customTo) {
        dateFrom = new Date(customFrom).getTime();
        dateTo = new Date(customTo + 'T23:59:59').getTime();
      }

      const all = await transactionRepo.getAll({
        type: 'transfer',
        dateFrom,
        dateTo,
        accountId: filterAccountId !== 'all' ? filterAccountId : undefined,
      });
      setTransfers(all);
      setLoading(false);
    }
    load();
  }, [datePreset, customFrom, customTo, filterAccountId]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const tx of transfers) {
      const key = formatDate(tx.date, 'yyyy-MM-dd');
      const existing = groups.get(key) ?? [];
      existing.push(tx);
      groups.set(key, existing);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transfers]);

  const summary = useMemo(() => {
    const total = transfers.reduce((s, t) => s + t.amount, 0);
    return { total, count: transfers.length };
  }, [transfers]);

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  function resetFilters() {
    setDatePreset('month');
    setCustomFrom('');
    setCustomTo('');
    setFilterAccountId('all');
  }

  const hasActiveFilter = filterAccountId !== 'all' || datePreset !== 'month';

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          Riwayat Transfer
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
          {hasActiveFilter && <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">!</span>}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Filter</span>
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-primary-500">
              <X className="h-3 w-3" />
              Reset
            </button>
          </div>
          <div className="mb-2 flex gap-1.5">
            {(['all', 'month', 'week', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setDatePreset(preset)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  datePreset === preset
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-400'
                }`}
              >
                {preset === 'all' ? 'Semua' : preset === 'month' ? 'Bulan Ini' : preset === 'week' ? 'Minggu Ini' : 'Kustom'}
              </button>
            ))}
          </div>
          {datePreset === 'custom' && (
            <div className="mb-2 flex gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
              <span className="self-center text-xs text-neutral-400">–</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
          )}
          <div>
            <select
              value={filterAccountId}
              onChange={(e) => setFilterAccountId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="all">Semua Akun</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!loading && summary.count > 0 && (
        <div className="rounded-xl bg-primary-50 p-3 dark:bg-primary-900/20">
          <div className="text-xs text-neutral-500">Total transfer</div>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {formatCurrency(summary.total)}
          </div>
          <div className="text-xs text-neutral-400">{summary.count} transfer</div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight className="h-12 w-12" />}
          title="Belum ada transfer"
          description="Transfer antar akun akan muncul di sini"
        />
      ) : (
        grouped.map(([dateKey, txs]) => {
          if (txs.length === 0) return null;
          const firstTx = txs[0]!;
          return (
          <div key={dateKey}>
            <div className="mb-1 px-1 text-xs font-medium text-neutral-400">
              {formatDateRelative(firstTx.date)}
              <span className="ml-1 text-neutral-300">— {formatDate(firstTx.date, 'dd MMM yyyy')}</span>
            </div>
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="mb-1 rounded-xl bg-white px-4 py-3 dark:bg-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-50">
                        <span>{getAccountName(tx.accountId)}</span>
                        <ArrowRight className="h-3 w-3 text-neutral-300" />
                        <span>{getAccountName(tx.toAccountId!)}</span>
                      </div>
                      {tx.notes && (
                        <div className="text-xs text-neutral-400">{tx.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-500">
                      {formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {format(tx.createdAt, 'HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          );
        })
      )}
    </div>
  );
}
