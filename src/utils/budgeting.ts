import { startOfDay, format } from 'date-fns';
import type { Transaction } from '@/types';
import type { DailyBudget, BudgetCycleResult, BudgetSummary } from '@/types/budgeting';
import { CYCLE_DAYS } from '@/types/budgeting';

export function toDateKey(timestamp: number): string {
  return format(timestamp, 'yyyy-MM-dd');
}

export function getCycleRange(cycleStart: number): { start: number; end: number } {
  const start = startOfDay(cycleStart).getTime();
  const end = start + (CYCLE_DAYS - 1) * 86400000 + 86399999;
  return { start, end };
}

export function isCycleExpired(cycleStart: number, now: number = Date.now()): boolean {
  const { end } = getCycleRange(cycleStart);
  return now > end;
}

export function getNewCycleStart(previousStart: number): number {
  return startOfDay(previousStart).getTime() + CYCLE_DAYS * 86400000;
}

function groupTransactionsByDay(
  transactions: Transaction[],
  cycleStart: number,
  cycleEnd: number
): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (tx.date < cycleStart || tx.date > cycleEnd) continue;
    const key = toDateKey(tx.date);
    map.set(key, (map.get(key) || 0) + tx.amount);
  }
  return map;
}

export function calculateDailyBudget(
  totalBudget: number,
  transactions: Transaction[],
  cycleStart: number
): BudgetCycleResult {
  const { start, end } = getCycleRange(cycleStart);
  const dailyBase = Math.floor(totalBudget / CYCLE_DAYS);
  const spentByDay = groupTransactionsByDay(transactions, start, end);

  const dailyBreakdown: DailyBudget[] = [];
  let carryForward = 0;
  let allocatedBudget = 0;

  for (let day = 0; day < CYCLE_DAYS; day++) {
    const dayTimestamp = startOfDay(new Date(start + day * 86400000)).getTime();
    const isLastDay = day === CYCLE_DAYS - 1;
    const dayBaseBudget = isLastDay ? totalBudget - allocatedBudget : dailyBase;

    const dateKey = toDateKey(dayTimestamp);
    const spent = spentByDay.get(dateKey) || 0;

    const effectiveBudget = dayBaseBudget + carryForward;
    const remaining = effectiveBudget - spent;
    const isOverBudget = spent > effectiveBudget;

    dailyBreakdown.push({
      date: dayTimestamp,
      baseBudget: dayBaseBudget,
      carryForward,
      effectiveBudget,
      spent,
      remaining,
      carryToNext: remaining,
      isOverBudget,
    });

    allocatedBudget += dayBaseBudget;
    carryForward = remaining;
  }

  return {
    cycleStart: start,
    cycleEnd: end,
    totalDays: CYCLE_DAYS,
    totalBudget,
    dailyBase,
    dailyBreakdown,
  };
}

export function getTodaysBudget(
  totalBudget: number,
  transactions: Transaction[],
  cycleStart: number,
  today: number = Date.now()
): DailyBudget | undefined {
  const cycle = calculateDailyBudget(totalBudget, transactions, cycleStart);
  const todayKey = toDateKey(today);
  return cycle.dailyBreakdown.find((d) => toDateKey(d.date) === todayKey);
}

export function getBudgetSummary(
  totalBudget: number,
  transactions: Transaction[],
  cycleStart: number,
  now: number = Date.now()
): BudgetSummary {
  const { start, end } = getCycleRange(cycleStart);
  const cycle = calculateDailyBudget(totalBudget, transactions, cycleStart);

  const totalSpent = transactions
    .filter((t) => t.type === 'expense' && t.date >= start && t.date <= now)
    .reduce((sum, t) => sum + t.amount, 0);

  const msPerDay = 86400000;
  const daysElapsed = Math.min(Math.floor((now - start) / msPerDay) + 1, CYCLE_DAYS);
  const daysRemaining = Math.max(CYCLE_DAYS - daysElapsed, 0);
  const totalRemaining = totalBudget - totalSpent;
  const averageDailySpend = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
  const projectedTotal = averageDailySpend * CYCLE_DAYS;

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    averageDailySpend,
    daysElapsed,
    daysRemaining,
    projectedTotal,
    isOnTrack: projectedTotal <= totalBudget,
    cycleStart: start,
    cycleEnd: end,
  };
}

export function getSpendingStatus(dailyBudget: DailyBudget): string {
  if (dailyBudget.effectiveBudget === 0) return 'hemat';
  const ratio = dailyBudget.spent / dailyBudget.effectiveBudget;
  if (ratio <= 0.5) return 'hemat';
  if (ratio <= 0.8) return 'normal';
  if (ratio <= 1.0) return 'mendekati_batas';
  return 'melebihi_batas';
}

export function getSuggestion(dailyBudget: DailyBudget): string {
  if (dailyBudget.isOverBudget) {
    const overAmount = Math.abs(dailyBudget.remaining);
    return `Hari ini kelebihan Rp${overAmount.toLocaleString('id-ID')}. Besok budget berkurang.`;
  }
  if (dailyBudget.carryToNext > 0) {
    return `Sisa Rp${dailyBudget.carryToNext.toLocaleString('id-ID')} akan ditambahkan ke budget besok.`;
  }
  return 'Budget hari ini pas.';
}
