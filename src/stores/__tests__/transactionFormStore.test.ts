import { describe, it, expect } from 'vitest';
import { useTransactionFormStore } from '../transactionFormStore';

describe('transactionFormStore', () => {
  it('starts with default values', () => {
    const state = useTransactionFormStore.getState();
    expect(state.type).toBe('expense');
    expect(state.amount).toBe('');
    expect(state.categoryId).toBeNull();
    expect(state.editId).toBeNull();
  });

  it('sets field values', () => {
    useTransactionFormStore.getState().setField('type', 'income');
    expect(useTransactionFormStore.getState().type).toBe('income');

    useTransactionFormStore.getState().setField('amount', '50000');
    expect(useTransactionFormStore.getState().amount).toBe('50000');

    useTransactionFormStore.getState().setField('categoryId', 'cat-salary');
    expect(useTransactionFormStore.getState().categoryId).toBe('cat-salary');
  });

  it('resets to initial state', () => {
    useTransactionFormStore.getState().setField('type', 'income');
    useTransactionFormStore.getState().setField('amount', '50000');
    useTransactionFormStore.getState().reset();

    const state = useTransactionFormStore.getState();
    expect(state.type).toBe('expense');
    expect(state.amount).toBe('');
    expect(state.categoryId).toBeNull();
    expect(state.editId).toBeNull();
  });
});
