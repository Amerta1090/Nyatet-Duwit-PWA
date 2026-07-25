export const CYCLE_DAYS = 30;

export interface DailyBudget {
  date: number;
  baseBudget: number;
  carryForward: number;
  effectiveBudget: number;
  spent: number;
  remaining: number;
  carryToNext: number;
  isOverBudget: boolean;
}

export interface BudgetCycleResult {
  cycleStart: number;
  cycleEnd: number;
  totalDays: number;
  totalBudget: number;
  dailyBase: number;
  dailyBreakdown: DailyBudget[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  averageDailySpend: number;
  daysElapsed: number;
  daysRemaining: number;
  projectedTotal: number;
  isOnTrack: boolean;
  cycleStart: number;
  cycleEnd: number;
}
