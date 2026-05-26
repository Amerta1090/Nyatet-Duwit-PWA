import { startOfDay as fnStartOfDay, startOfMonth as fnStartOfMonth, endOfMonth } from 'date-fns';

export function startOfDay(timestamp: number): number {
  return fnStartOfDay(timestamp).getTime();
}

export function startOfMonth(timestamp: number): number {
  return fnStartOfMonth(timestamp).getTime();
}

export function getMonthRange(timestamp: number): { start: number; end: number } {
  const start = fnStartOfMonth(timestamp).getTime();
  const end = endOfMonth(timestamp).getTime();
  return { start, end };
}

export function getTodayRange(): { start: number; end: number } {
  const now = Date.now();
  const start = fnStartOfDay(now).getTime();
  const end = now;
  return { start, end };
}
