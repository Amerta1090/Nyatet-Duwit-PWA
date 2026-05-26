export { colors, spacing, radius, shadows } from './tokens';
export { DEFAULT_CATEGORIES } from './defaultCategories';

export const DEFAULT_ACCOUNT = {
  name: 'Cash',
  type: 'cash' as const,
  balance: 0,
  currency: 'IDR',
  icon: 'wallet',
  color: '#10B981',
};

export const DEFAULT_SETTINGS: Record<string, string> = {
  currency: 'IDR',
  reminder_time: '20:00',
  first_transaction_done: 'false',
};
