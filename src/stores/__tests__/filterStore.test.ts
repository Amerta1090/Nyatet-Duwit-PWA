import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({
      datePreset: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      type: 'all',
      categoryId: undefined,
      accountId: undefined,
      sortField: 'date',
      sortDir: 'desc',
      showFilterModal: false,
    });
  });

  it('sets date preset', () => {
    useFilterStore.getState().setDatePreset('today');
    expect(useFilterStore.getState().datePreset).toBe('today');
  });

  it('sets custom date range', () => {
    const from = 1000;
    const to = 2000;
    useFilterStore.getState().setCustomDate(from, to);
    expect(useFilterStore.getState().datePreset).toBe('custom');
    expect(useFilterStore.getState().dateFrom).toBe(from);
    expect(useFilterStore.getState().dateTo).toBe(to);
  });

  it('sets type filter', () => {
    useFilterStore.getState().setType('expense');
    expect(useFilterStore.getState().type).toBe('expense');
  });

  it('sets category filter', () => {
    useFilterStore.getState().setCategoryId('cat-1');
    expect(useFilterStore.getState().categoryId).toBe('cat-1');
  });

  it('sets account filter', () => {
    useFilterStore.getState().setAccountId('acc-1');
    expect(useFilterStore.getState().accountId).toBe('acc-1');
  });

  it('toggles sort direction', () => {
    expect(useFilterStore.getState().sortDir).toBe('desc');
    useFilterStore.getState().toggleSortDir();
    expect(useFilterStore.getState().sortDir).toBe('asc');
    useFilterStore.getState().toggleSortDir();
    expect(useFilterStore.getState().sortDir).toBe('desc');
  });

  it('sets sort field', () => {
    useFilterStore.getState().setSortField('amount');
    expect(useFilterStore.getState().sortField).toBe('amount');
  });

  it('clears all filters', () => {
    useFilterStore.getState().setDatePreset('today');
    useFilterStore.getState().setType('expense');
    useFilterStore.getState().setCategoryId('cat-1');
    useFilterStore.getState().clearFilters();
    expect(useFilterStore.getState().datePreset).toBe('all');
    expect(useFilterStore.getState().type).toBe('all');
    expect(useFilterStore.getState().categoryId).toBeUndefined();
    expect(useFilterStore.getState().accountId).toBeUndefined();
  });

  it('counts active filters correctly', () => {
    expect(useFilterStore.getState().activeFilterCount()).toBe(0);
    useFilterStore.getState().setDatePreset('today');
    expect(useFilterStore.getState().activeFilterCount()).toBe(1);
    useFilterStore.getState().setType('expense');
    expect(useFilterStore.getState().activeFilterCount()).toBe(2);
    useFilterStore.getState().setCategoryId('cat-1');
    expect(useFilterStore.getState().activeFilterCount()).toBe(3);
    useFilterStore.getState().clearFilters();
    expect(useFilterStore.getState().activeFilterCount()).toBe(0);
  });

  it('shows/hides filter modal', () => {
    useFilterStore.getState().setShowFilterModal(true);
    expect(useFilterStore.getState().showFilterModal).toBe(true);
    useFilterStore.getState().setShowFilterModal(false);
    expect(useFilterStore.getState().showFilterModal).toBe(false);
  });
});
