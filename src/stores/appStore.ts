import { create } from 'zustand';

interface AppState {
  lastUsedCategoryId: string | null;
  lastUsedAccountId: string | null;
  lastTransactionType: 'income' | 'expense' | 'transfer';
  darkMode: boolean;
  onboardingCompleted: boolean;
  language: 'id' | 'en';
  showDecimals: boolean;
  updateLastUsed: (categoryId: string, accountId: string, type: 'income' | 'expense' | 'transfer') => void;
  toggleDarkMode: () => void;
  setOnboardingCompleted: (v: boolean) => void;
  setLanguage: (lang: 'id' | 'en') => void;
  setShowDecimals: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastUsedCategoryId: null,
  lastUsedAccountId: null,
  lastTransactionType: 'expense',
  darkMode: false,
  onboardingCompleted: true,
  language: 'id',
  showDecimals: false,
  updateLastUsed: (categoryId, accountId, type) =>
    set({ lastUsedCategoryId: categoryId, lastUsedAccountId: accountId, lastTransactionType: type }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
  setLanguage: (lang) => set({ language: lang }),
  setShowDecimals: (v) => set({ showDecimals: v }),
}));
