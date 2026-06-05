import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Transaction, Category, Account, Tag } from '@/types';
import { TransactionItem } from './TransactionItem';
import { formatDateRelative, formatDate, formatCurrency } from '@/utils/format';
import { EmptyState, Skeleton } from '@/components/ui';
import { ArrowLeftRight } from 'lucide-react';

interface GroupedTransactions {
  label: string;
  date: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  tags?: Tag[];
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

function getTagMap(tags: Tag[]): Record<string, Tag> {
  const map: Record<string, Tag> = {};
  for (const t of tags) map[t.id] = t;
  return map;
}

function getTagsForTx(tx: Transaction, tagMap: Record<string, Tag>): { id: string; name: string; color: string }[] {
  if (!tx.tags || tx.tags.length === 0) return [];
  return tx.tags
    .map((id) => tagMap[id])
    .filter((t): t is Tag => !!t)
    .map((t) => ({ id: t.id, name: t.name, color: t.color }));
}

function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, { label: string; date: number; txs: Transaction[]; totalIncome: number; totalExpense: number }>();

  for (const tx of transactions) {
    const key = formatDateRelative(tx.date);
    const existing = groups.get(key);
    if (existing) {
      existing.txs.push(tx);
      if (tx.type === 'income') existing.totalIncome += tx.amount;
      else if (tx.type === 'expense') existing.totalExpense += tx.amount;
    } else {
      groups.set(key, {
        label: key,
        date: tx.date,
        txs: [tx],
        totalIncome: tx.type === 'income' ? tx.amount : 0,
        totalExpense: tx.type === 'expense' ? tx.amount : 0,
      });
    }
  }

  return Array.from(groups.values()).map((g) => ({
    label: g.label,
    date: g.date,
    transactions: g.txs,
    totalIncome: g.totalIncome,
    totalExpense: g.totalExpense,
  }));
}

const GROUP_HEADER_H = 40;
const TRANSACTION_H = 72;

export function TransactionList({ transactions, categories, accounts, tags = [], loading, onEdit, onDelete, onRowClick }: TransactionListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoryMap = useMemo(() => getCategoryMap(categories), [categories]);
  const accountMap = useMemo(() => getAccountMap(accounts), [accounts]);
  const tagMap = useMemo(() => getTagMap(tags), [tags]);
  const groups = useMemo(() => groupByDate(transactions), [transactions]);

  const flatItems = useMemo(() => {
    const items: Array<{ type: 'header' | 'transaction'; key: string; group?: GroupedTransactions; tx?: Transaction }> = [];
    for (const g of groups) {
      items.push({ type: 'header', key: `h-${g.date}`, group: g });
      for (const tx of g.transactions) {
        items.push({ type: 'transaction', key: tx.id, tx });
      }
    }
    return items;
  }, [groups]);

  const totalSize = flatItems.reduce((s, i) => s + (i.type === 'header' ? GROUP_HEADER_H : TRANSACTION_H), 0);

  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => flatItems[i]!.type === 'header' ? GROUP_HEADER_H : TRANSACTION_H,
    overscan: 5,
  });

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
        description="Tap + untuk mencatat transaksi pertama kamu"
      />
    );
  }

  if (flatItems.length < 50) {
    return (
      <div className="flex flex-col gap-4 py-2">
        {groups.map((group) => (
          <div key={group.date}>
            <div className="mb-2 px-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                {group.label} · {formatDate(group.date, 'dd MMM yyyy')}
              </h3>
              {(group.totalIncome > 0 || group.totalExpense > 0) && (
                <div className="mt-0.5 flex items-center gap-3">
                  {group.totalExpense > 0 && (
                    <span className="text-[11px] text-danger-500">
                      ↓ {formatCurrency(group.totalExpense)}
                    </span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-[11px] text-accent-500">
                      ↑ {formatCurrency(group.totalIncome)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={categoryMap[tx.categoryId]}
                  account={accountMap[tx.accountId]}
                  toAccount={tx.toAccountId ? accountMap[tx.toAccountId] : undefined}
                  tags={getTagsForTx(tx, tagMap)}
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

  const items = virtualizer.getVirtualItems();
  return (
    <div ref={scrollRef} className="h-full overflow-auto">
      <div
        className="relative"
        style={{ height: totalSize }}
      >
        {items.map((vItem) => {
          const item = flatItems[vItem.index]!;
          if (item.type === 'header') {
            const g = item.group!;
            return (
              <div
                key={item.key}
                className="absolute top-0 left-0 w-full"
                style={{ height: GROUP_HEADER_H, transform: `translateY(${vItem.start}px)` }}
              >
                <div className="px-1 py-1">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    {g.label} · {formatDate(g.date, 'dd MMM yyyy')}
                  </h3>
                  {(g.totalIncome > 0 || g.totalExpense > 0) && (
                    <div className="mt-0.5 flex items-center gap-3">
                      {g.totalExpense > 0 && (
                        <span className="text-[11px] text-danger-500">
                          ↓ {formatCurrency(g.totalExpense)}
                        </span>
                      )}
                      {g.totalIncome > 0 && (
                        <span className="text-[11px] text-accent-500">
                          ↑ {formatCurrency(g.totalIncome)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          const tx = item.tx!;
          return (
            <div
              key={item.key}
              className="absolute top-0 left-0 w-full"
              style={{ height: TRANSACTION_H, transform: `translateY(${vItem.start}px)` }}
            >
              <TransactionItem
                transaction={tx}
                category={categoryMap[tx.categoryId]}
                account={accountMap[tx.accountId]}
                toAccount={tx.toAccountId ? accountMap[tx.toAccountId] : undefined}
                tags={getTagsForTx(tx, tagMap)}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={onRowClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
