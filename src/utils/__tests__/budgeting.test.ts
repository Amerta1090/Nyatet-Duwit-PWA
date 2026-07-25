import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateDailyBudget,
  getTodaysBudget,
  getBudgetSummary,
  getSpendingStatus,
  getSuggestion,
  toDateKey,
  getCycleRange,
  isCycleExpired,
  getNewCycleStart,
} from '../budgeting';
import { CYCLE_DAYS } from '@/types/budgeting';
import type { Transaction } from '@/types';
import { startOfDay } from 'date-fns';

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    type: 'expense',
    amount: 10000,
    categoryId: 'cat-1',
    accountId: 'acc-1',
    date: Date.now(),
    notes: '',
    createdAt: Date.now(),
    ...overrides,
  };
}

function getCycleStart(date: Date = new Date()): number {
  return startOfDay(date).getTime();
}

describe('toDateKey', () => {
  it('formats timestamp to yyyy-MM-dd', () => {
    const ts = new Date(2025, 0, 15).getTime();
    expect(toDateKey(ts)).toBe('2025-01-15');
  });
});

describe('getCycleRange', () => {
  it('returns30-day range from cycleStart', () => {
    const start = startOfDay(new Date(2025, 0, 1)).getTime();
    const { start: s, end } = getCycleRange(start);
    expect(s).toBe(start);
    const rangeMs = end - start;
    expect(rangeMs).toBe(CYCLE_DAYS * 86400000 - 1);
  });

  it('normalizes start to midnight', () => {
    const messy = new Date(2025, 0, 1, 14, 30).getTime();
    const { start } = getCycleRange(messy);
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe('isCycleExpired', () => {
  it('returns false when within cycle', () => {
    const start = startOfDay(new Date(2025, 0, 1)).getTime();
    const now = start + 10 * 86400000;
    expect(isCycleExpired(start, now)).toBe(false);
  });

  it('returns true when past cycle end', () => {
    const start = startOfDay(new Date(2025, 0, 1)).getTime();
    const now = start + CYCLE_DAYS * 86400000 + 1;
    expect(isCycleExpired(start, now)).toBe(true);
  });
});

describe('getNewCycleStart', () => {
  it('returns next cycle start30 days later', () => {
    const start = startOfDay(new Date(2025, 0, 1)).getTime();
    const next = getNewCycleStart(start);
    expect(next).toBe(start + CYCLE_DAYS * 86400000);
  });
});

describe('calculateDailyBudget', () => {
  it('always divides total by30 regardless of cycle start', () => {
    const cycleStart = getCycleStart(new Date(2025, 5, 15));
    const result = calculateDailyBudget(100000, [], cycleStart);
    expect(result.totalDays).toBe(CYCLE_DAYS);
    expect(result.dailyBreakdown).toHaveLength(CYCLE_DAYS);
    expect(result.dailyBase).toBe(Math.floor(100000 / CYCLE_DAYS));
  });

  it('last day absorbs rounding remainder', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const result = calculateDailyBudget(100000, [], cycleStart);
    const lastDay = result.dailyBreakdown[CYCLE_DAYS - 1];
    const otherDays = result.dailyBreakdown.slice(0, CYCLE_DAYS - 1);
    const totalFromDays = otherDays.reduce((s, d) => s + d.baseBudget, 0) + lastDay.baseBudget;
    expect(totalFromDays).toBe(100000);
  });

  it('carries forward unspent budget to next day', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const tx = makeTx({ amount: 10000, date: cycleStart });
    const result = calculateDailyBudget(60000, [tx], cycleStart);
    const day1 = result.dailyBreakdown[0];
    const day2 = result.dailyBreakdown[1];
    expect(day1.remaining).toBe(day1.effectiveBudget - 10000);
    expect(day2.carryForward).toBe(day1.remaining);
    expect(day2.effectiveBudget).toBe(day2.baseBudget + day1.remaining);
  });

  it('carries forward overspending as negative', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const daily = Math.floor(60000 / CYCLE_DAYS);
    const tx = makeTx({ amount: daily + 5000, date: cycleStart });
    const result = calculateDailyBudget(60000, [tx], cycleStart);
    const day1 = result.dailyBreakdown[0];
    const day2 = result.dailyBreakdown[1];
    expect(day1.isOverBudget).toBe(true);
    expect(day2.carryForward).toBeLessThan(0);
    expect(day2.effectiveBudget).toBe(day2.baseBudget + day1.carryToNext);
  });

  it('marks day as overBudget when spent exceeds effective', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const daily = Math.floor(60000 / CYCLE_DAYS);
    const tx = makeTx({ amount: daily + 1000, date: cycleStart });
    const result = calculateDailyBudget(60000, [tx], cycleStart);
    expect(result.dailyBreakdown[0].isOverBudget).toBe(true);
  });

  it('ignores income transactions', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const tx = makeTx({ type: 'income', amount: 50000, date: cycleStart });
    const result = calculateDailyBudget(60000, [tx], cycleStart);
    expect(result.dailyBreakdown[0].spent).toBe(0);
  });

  it('ignores transactions outside cycle range', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const tx = makeTx({ amount: 50000, date: cycleStart + (CYCLE_DAYS + 5) * 86400000 });
    const result = calculateDailyBudget(60000, [tx], cycleStart);
    expect(result.dailyBreakdown[0].spent).toBe(0);
  });

  it('aggregates multiple transactions on same day', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const txs = [
      makeTx({ amount: 5000, date: cycleStart }),
      makeTx({ id: 'tx-2', amount: 7000, date: cycleStart }),
    ];
    const result = calculateDailyBudget(60000, txs, cycleStart);
    expect(result.dailyBreakdown[0].spent).toBe(12000);
  });

  it('handles zero budget', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const result = calculateDailyBudget(0, [], cycleStart);
    expect(result.dailyBase).toBe(0);
    expect(result.dailyBreakdown.every((d) => d.baseBudget === 0)).toBe(true);
  });

  it('carries forward chain across multiple days', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const daily = Math.floor(60000 / CYCLE_DAYS);
    const txs = [
      makeTx({ amount: daily - 1000, date: cycleStart }),
      makeTx({ id: 'tx-2', amount: daily - 500, date: cycleStart + 86400000 }),
    ];
    const result = calculateDailyBudget(60000, txs, cycleStart);
    const day1 = result.dailyBreakdown[0];
    const day2 = result.dailyBreakdown[1];
    const day3 = result.dailyBreakdown[2];
    expect(day2.carryForward).toBe(day1.remaining);
    expect(day3.carryForward).toBe(day2.remaining);
  });
});

describe('getTodaysBudget', () => {
  it('returns today budget within cycle', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const tx = makeTx({ amount: 5000, date: cycleStart });
    const today = getTodaysBudget(60000, [tx], cycleStart, cycleStart);
    expect(today).toBeDefined();
    expect(today!.spent).toBe(5000);
  });

  it('returns undefined if today is outside cycle', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const outsideDay = cycleStart + (CYCLE_DAYS + 5) * 86400000;
    const result = getTodaysBudget(60000, [], cycleStart, outsideDay);
    expect(result).toBeUndefined();
  });
});

describe('getBudgetSummary', () => {
  it('calculates correct summary for mid-cycle', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const now = cycleStart + 5 * 86400000;
    const txs = [makeTx({ amount: 10000, date: cycleStart })];
    const summary = getBudgetSummary(60000, txs, cycleStart, now);
    expect(summary.totalBudget).toBe(60000);
    expect(summary.totalSpent).toBe(10000);
    expect(summary.totalRemaining).toBe(50000);
    expect(summary.daysElapsed).toBe(6);
    expect(summary.daysRemaining).toBe(CYCLE_DAYS - 6);
  });

  it('marks isOnTrack when projected within budget', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const now = cycleStart + 5 * 86400000;
    const txs = [makeTx({ amount: 5000, date: cycleStart })];
    const summary = getBudgetSummary(60000, txs, cycleStart, now);
    expect(summary.isOnTrack).toBe(true);
  });

  it('marks isOnTrack false when projected over budget', () => {
    const cycleStart = getCycleStart(new Date(2025, 0, 1));
    const now = cycleStart + 10 * 86400000;
    const txs = [makeTx({ amount: 30000, date: cycleStart + 9 * 86400000 })];
    const summary = getBudgetSummary(60000, txs, cycleStart, now);
    expect(summary.isOnTrack).toBe(false);
  });
});

describe('getSpendingStatus', () => {
  it('returns hemat when spending under50%', () => {
    expect(getSpendingStatus({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 500, remaining: 1500, carryToNext: 1500, isOverBudget: false,
    })).toBe('hemat');
  });

  it('returns normal when50-80%', () => {
    expect(getSpendingStatus({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 1400, remaining: 600, carryToNext: 600, isOverBudget: false,
    })).toBe('normal');
  });

  it('returns mendekati_batas when80-100%', () => {
    expect(getSpendingStatus({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 1900, remaining: 100, carryToNext: 100, isOverBudget: false,
    })).toBe('mendekati_batas');
  });

  it('returns melebihi_batas when over100%', () => {
    expect(getSpendingStatus({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 2500, remaining: -500, carryToNext: -500, isOverBudget: true,
    })).toBe('melebihi_batas');
  });
});

describe('getSuggestion', () => {
  it('warns about overspending', () => {
    const result = getSuggestion({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 3000, remaining: -1000, carryToNext: -1000, isOverBudget: true,
    });
    expect(result).toContain('kelebihan');
    expect(result).toContain('1.000');
  });

  it('suggests carry forward savings', () => {
    const result = getSuggestion({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 500, remaining: 1500, carryToNext: 1500, isOverBudget: false,
    });
    expect(result).toContain('ditambahkan');
    expect(result).toContain('1.500');
  });

  it('returns neutral when exact', () => {
    const result = getSuggestion({
      date: 0, baseBudget: 2000, carryForward: 0, effectiveBudget: 2000,
      spent: 2000, remaining: 0, carryToNext: 0, isOverBudget: false,
    });
    expect(result).toContain('pas');
  });
});
