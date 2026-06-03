import { useState, useRef, createElement, memo } from 'react';
import { ArrowRightLeft, Trash2, Pencil } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency, formatTimeAgo } from '@/utils/format';
import { getCategoryIcon } from '@/utils/icons';
import { cn } from '@/utils/cn';
import type { Category, Account } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  toAccount?: Account;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onRowClick?: (tx: Transaction) => void;
}

export const TransactionItem = memo(function TransactionItem({ transaction: tx, category, account, toAccount, onEdit, onDelete, onRowClick }: TransactionItemProps) {
  const [swiping, setSwiping] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const iconElement = category
    ? createElement(getCategoryIcon(category.icon), { className: 'h-5 w-5', style: { color: category.color ?? '#64748B' } })
    : createElement(ArrowRightLeft, { className: 'h-5 w-5' });

  const amountColor = tx.type === 'income'
    ? 'text-accent-500'
    : tx.type === 'expense'
      ? 'text-danger-500'
      : 'text-primary-500';

  const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer';

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0]!.clientX;
    isDragging.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const diff = startX.current - e.touches[0]!.clientX;
    if (Math.abs(diff) > 5) isDragging.current = true;
    setOffsetX(Math.max(Math.min(diff, 160), -160));
    setSwiping(true);
  }

  function handleTouchEnd() {
    if (!isDragging.current) {
      onRowClick?.(tx);
      return;
    }
    if (offsetX > 80) {
      onDelete(tx);
    } else if (offsetX < -80) {
      onEdit(tx);
    }
    setOffsetX(0);
    setSwiping(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute right-0 top-0 flex h-full items-center gap-1 px-3">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(tx); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-500 text-white"
          aria-label="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <button
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (isDragging.current) return;
          onRowClick?.(tx);
        }}
        className={cn(
          'relative flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition-transform duration-200 dark:bg-neutral-900',
          swiping && 'cursor-grabbing',
        )}
        style={{ transform: `translateX(${-offsetX}px)` }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category?.color ? `${category.color}20` : undefined }}
        >
          {iconElement}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {category?.name ?? typeLabel}
            </span>
            {account && (
              <span className="shrink-0 text-[10px] text-neutral-400">{account.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{tx.notes || typeLabel}</span>
            {tx.type === 'transfer' && toAccount && (
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                {toAccount.name}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={cn('block text-sm font-semibold', amountColor)}>
            {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
          </span>
          <span className="text-[10px] text-neutral-400">{formatTimeAgo(tx.date)}</span>
        </div>
      </button>
    </div>
  );
});
