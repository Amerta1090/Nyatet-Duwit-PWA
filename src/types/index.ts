export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'savings' | 'goal';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isPrimary: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: number;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  sortOrder?: number;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  budgetLimit?: number;
  order: number;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  template: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    notes?: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  isActive: boolean;
  lastGenerated?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  accountId?: string;
  icon: string;
  color: string;
  deadline?: number;
  achievedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Debt {
  id: string;
  type: 'owed' | 'owing';
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  key: string;
  value: string;
}
