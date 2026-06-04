import { create } from 'zustand';

export type DateFilterPreset = 'all' | 'today' | 'week' | 'month' | 'custom';
export type SortField = 'date' | 'amount';
export type SortDir = 'asc' | 'desc';

interface FilterState {
  datePreset: DateFilterPreset;
  dateFrom: number | undefined;
  dateTo: number | undefined;
  type: string;
  categoryId: string | undefined;
  accountId: string | undefined;
  tagIds: string[];
  sortField: SortField;
  sortDir: SortDir;
  showFilterModal: boolean;

  setDatePreset: (preset: DateFilterPreset) => void;
  setCustomDate: (from: number, to: number) => void;
  setType: (type: string) => void;
  setCategoryId: (id: string | undefined) => void;
  setAccountId: (id: string | undefined) => void;
  setTagIds: (ids: string[]) => void;
  setSortField: (field: SortField) => void;
  toggleSortDir: () => void;
  setShowFilterModal: (show: boolean) => void;
  clearFilters: () => void;

  activeFilterCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  datePreset: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  type: 'all',
  categoryId: undefined,
  accountId: undefined,
  tagIds: [],
  sortField: 'date',
  sortDir: 'desc',
  showFilterModal: false,

  setDatePreset: (preset) => set({ datePreset: preset, dateFrom: undefined, dateTo: undefined }),
  setCustomDate: (from, to) => set({ datePreset: 'custom', dateFrom: from, dateTo: to }),
  setType: (type) => set({ type }),
  setCategoryId: (id) => set({ categoryId: id }),
  setAccountId: (id) => set({ accountId: id }),
  setTagIds: (ids) => set({ tagIds: ids }),
  setSortField: (field) => set({ sortField: field }),
  toggleSortDir: () => set((s) => ({ sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' })),
  setShowFilterModal: (show) => set({ showFilterModal: show }),
  clearFilters: () => set({
    datePreset: 'all', dateFrom: undefined, dateTo: undefined,
    type: 'all', categoryId: undefined, accountId: undefined, tagIds: [],
  }),

  activeFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.datePreset !== 'all') count++;
    if (s.type !== 'all') count++;
    if (s.categoryId) count++;
    if (s.accountId) count++;
    if (s.tagIds.length > 0) count++;
    return count;
  },
}));
