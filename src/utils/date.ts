import { startOfDay as fnStartOfDay, startOfMonth as fnStartOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

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

export function getWeekRange(timestamp: number): { start: number; end: number } {
  const start = startOfWeek(timestamp, { weekStartsOn: 1 }).getTime();
  const end = endOfWeek(timestamp, { weekStartsOn: 1 }).getTime();
  return { start, end };
}

export function getTodayRange(): { start: number; end: number } {
  const now = Date.now();
  const start = fnStartOfDay(now).getTime();
  const end = now;
  return { start, end };
}

export function getMonthLabel(year: number, month: number): string {
  const d = new Date(year, month);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function getDayLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
}
