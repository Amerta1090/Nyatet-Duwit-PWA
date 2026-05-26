import { useMemo } from 'react';
import type { Transaction, Category, Account } from '@/types';
import { TransactionItem } from './TransactionItem';
import { formatDateRelative, formatDate } from '@/utils/format';
import { EmptyState, Skeleton } from '@/components/ui';
import { ArrowLeftRight } from 'lucide-react';

interface GroupedTransactions {
  label: string;
  date: number;
  transactions: Transaction[];
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  loading?: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onRowClick?: (tx: Transaction) => void;
}

function getCategoryMap(categories: Category[]): Record<string, Category> {
  const map: Record<string, Category> = {};
  for (const c of categories) map[c.id] = c;
  return map;
}

function getAccountMap(accounts: Account[]): Record<string, Account> {
  const map: Record<string, Account> = {};
  for (const a of accounts) map[a.id] = a;
  return map;
}

function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, { label: string; date: number; txs: Transaction[] }>();

  for (const tx of transactions) {
    const key = formatDateRelative(tx.date);
    const existing = groups.get(key);
    if (existing) {
      existing.txs.push(tx);
    } else {
      groups.set(key, { label: key, date: tx.date, txs: [tx] });
    }
  }

  return Array.from(groups.values()).map((g) => ({
    label: g.label,
    date: g.date,
    transactions: g.txs,
  }));
}

export function TransactionList({ transactions, categories, accounts, loading, onEdit, onDelete, onRowClick }: TransactionListProps) {
  const categoryMap = useMemo(() => getCategoryMap(categories), [categories]);
  const accountMap = useMemo(() => getAccountMap(accounts), [accounts]);
  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <Skeleton height="60px" lines={5} />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ArrowLeftRight className="h-12 w-12" />}
        title="Belum ada transaksi"
        description="Mulai catat pengeluaran atau pemasukan pertama kamu"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="mb-2 px-1">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              {group.label} · {formatDate(group.date, 'dd MMM yyyy')}
            </h3>
          </div>
          <div className="flex flex-col gap-1">
            {group.transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={categoryMap[tx.categoryId]}
                account={accountMap[tx.accountId]}
                toAccount={tx.toAccountId ? accountMap[tx.toAccountId] : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={onRowClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
