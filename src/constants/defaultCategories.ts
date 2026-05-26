import type { Category } from '@/types';

export const DEFAULT_CATEGORIES: (Omit<Category, 'createdAt'> & { createdAt?: number })[] = [
  { id: 'cat-food', name: 'Makan & Minum', type: 'expense', icon: 'utensils', color: '#F59E0B', order: 1, isDefault: true },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: 'car', color: '#3B82F6', order: 2, isDefault: true },
  { id: 'cat-shopping', name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#8B5CF6', order: 3, isDefault: true },
  { id: 'cat-entertainment', name: 'Hiburan', type: 'expense', icon: 'gamepad-2', color: '#EC4899', order: 4, isDefault: true },
  { id: 'cat-bills', name: 'Tagihan', type: 'expense', icon: 'receipt', color: '#6366F1', order: 5, isDefault: true },
  { id: 'cat-health', name: 'Kesehatan', type: 'expense', icon: 'heart-pulse', color: '#EF4444', order: 6, isDefault: true },
  { id: 'cat-education', name: 'Pendidikan', type: 'expense', icon: 'graduation-cap', color: '#14B8A6', order: 7, isDefault: true },
  { id: 'cat-other-expense', name: 'Lainnya', type: 'expense', icon: 'ellipsis', color: '#64748B', order: 8, isDefault: true },
  { id: 'cat-salary', name: 'Gaji', type: 'income', icon: 'banknote', color: '#10B981', order: 1, isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'laptop', color: '#06B6D4', order: 2, isDefault: true },
  { id: 'cat-investment', name: 'Investasi', type: 'income', icon: 'trending-up', color: '#84CC16', order: 3, isDefault: true },
  { id: 'cat-other-income', name: 'Lainnya', type: 'income', icon: 'ellipsis', color: '#64748B', order: 4, isDefault: true },
];
