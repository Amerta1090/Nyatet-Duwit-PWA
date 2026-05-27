import { describe, it, expect } from 'vitest';
import { useFilterStore } from '@/stores/filterStore';

describe('FilterModal', () => {
  it('starts with default filter state', () => {
    const state = useFilterStore.getState();
    expect(state.datePreset).toBe('all');
    expect(state.type).toBe('all');
    expect(state.sortDir).toBe('desc');
    expect(state.sortField).toBe('date');
    expect(state.dateFrom).toBeUndefined();
    expect(state.dateTo).toBeUndefined();
  });

  it('sets date preset to today', () => {
    useFilterStore.getState().setDatePreset('today');
    expect(useFilterStore.getState().datePreset).toBe('today');
  });

  it('sets filter type', () => {
    useFilterStore.getState().setType('income');
    expect(useFilterStore.getState().type).toBe('income');
  });

  it('toggles sort direction', () => {
    const initial = useFilterStore.getState().sortDir;
    useFilterStore.getState().toggleSortDir();
    expect(useFilterStore.getState().sortDir).not.toBe(initial);
  });

  it('clears all filters', () => {
    useFilterStore.getState().setDatePreset('today');
    useFilterStore.getState().setType('income');
    useFilterStore.getState().clearFilters();
    expect(useFilterStore.getState().datePreset).toBe('all');
    expect(useFilterStore.getState().type).toBe('all');
  });

  it('tracks active filter count', () => {
    useFilterStore.getState().setDatePreset('today');
    const count = useFilterStore.getState().activeFilterCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});