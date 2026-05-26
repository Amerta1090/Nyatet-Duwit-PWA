import { create } from 'zustand';

interface TransactionFormState {
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  categoryId: string | null;
  accountId: string | null;
  toAccountId: string | null;
  date: number;
  notes: string;
  editId: string | null;
  reset: () => void;
  setField: <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => void;
}

const initialState = {
  type: 'expense' as const,
  amount: '',
  categoryId: null,
  accountId: null,
  toAccountId: null,
  date: Date.now(),
  notes: '',
  editId: null,
};

export const useTransactionFormStore = create<TransactionFormState>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setField: (field, value) => set({ [field]: value } as Partial<TransactionFormState>),
}));
