import { format, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';

let _showDecimals = false;

export function setShowDecimals(v: boolean) {
  _showDecimals = v;
}

export function formatCurrency(amount: number, showDecimals?: boolean): string {
  const dec = showDecimals ?? _showDecimals;
  const formatted = Math.abs(amount).toLocaleString('id-ID', {
    minimumFractionDigits: dec ? 0 : 0,
    maximumFractionDigits: dec ? 2 : 0,
  });

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
  return format(timestamp, 'HH:mm', { locale: id });
}
