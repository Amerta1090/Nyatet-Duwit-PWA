import { format, differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears } from 'date-fns';
import { id } from 'date-fns/locale';

let _showDecimals = false;

export function setShowDecimals(v: boolean) {
  _showDecimals = v;
}

export function formatCurrency(amount: number, showDecimals?: boolean): string {
  const dec = showDecimals ?? _showDecimals;
  const prefix = amount < 0 ? '-Rp ' : 'Rp ';
  const formatted = Math.abs(amount).toLocaleString('id-ID', {
    minimumFractionDigits: dec ? 0 : 0,
    maximumFractionDigits: dec ? 2 : 0,
  });

  return `${prefix}${formatted}`;
}

export function formatDate(timestamp: number, formatStr: string = 'dd MMM yyyy'): string {
  return format(timestamp, formatStr, { locale: id });
}

export function formatDateShort(timestamp: number): string {
  return format(timestamp, 'dd MMM', { locale: id });
}

export function formatDateRelative(timestamp: number): string {
  const now = Date.now();
  const days = differenceInCalendarDays(now, timestamp);
  const months = differenceInCalendarMonths(now, timestamp);
  const years = differenceInCalendarYears(now, timestamp);

  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days <= 6) return `${days} hari yang lalu`;
  if (days <= 13) return 'Minggu lalu';
  if (days <= 20) return '2 minggu yang lalu';
  if (days <= 27) return '3 minggu yang lalu';
  if (months <= 1) return 'Bulan lalu';
  if (months < 12) return `${months} bulan yang lalu`;
  if (years === 1) return 'Tahun lalu';
  return `${years} tahun yang lalu`;
}

export function formatTimeAgo(timestamp: number): string {
  return format(timestamp, 'HH:mm', { locale: id });
}
