import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount)
    .toLocaleString('id-ID')
    .replace(/,/g, '.');

  return `Rp ${formatted}`;
}

export function formatDate(timestamp: number, formatStr: string = 'dd MMM yyyy'): string {
  return format(timestamp, formatStr, { locale: id });
}

export function formatDateShort(timestamp: number): string {
  return format(timestamp, 'dd MMM', { locale: id });
}

export function formatDateRelative(timestamp: number): string {
  if (isToday(timestamp)) return 'Hari ini';
  if (isYesterday(timestamp)) return 'Kemarin';
  return format(timestamp, 'dd MMM yyyy', { locale: id });
}

export function formatTimeAgo(timestamp: number): string {
  return formatDistanceToNow(timestamp, { addSuffix: true, locale: id });
}
