import { create } from 'zustand';

interface AppState {
  lastUsedCategoryId: string | null;
  lastUsedAccountId: string | null;
  lastTransactionType: 'income' | 'expense' | 'transfer';
  darkMode: boolean;
  updateLastUsed: (categoryId: string, accountId: string, type: 'income' | 'expense' | 'transfer') => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastUsedCategoryId: null,
  lastUsedAccountId: null,
  lastTransactionType: 'expense',
  darkMode: false,
  updateLastUsed: (categoryId, accountId, type) =>
    set({ lastUsedCategoryId: categoryId, lastUsedAccountId: accountId, lastTransactionType: type }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
