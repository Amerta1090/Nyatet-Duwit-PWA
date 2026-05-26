import { describe, it, expect, vi } from 'vitest';
import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  it('starts with default values', () => {
    const state = useUIStore.getState();
    expect(state.bottomSheetOpen).toBe(false);
    expect(state.toast).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('opens and closes bottom sheet', () => {
    useUIStore.getState().openBottomSheet('content');
    expect(useUIStore.getState().bottomSheetOpen).toBe(true);

    useUIStore.getState().closeBottomSheet();
    expect(useUIStore.getState().bottomSheetOpen).toBe(false);
    expect(useUIStore.getState().bottomSheetContent).toBeNull();
  });

  it('shows and hides toast', () => {
    const undoFn = vi.fn();
    useUIStore.getState().showToast('Test', 'success', undoFn);

    const toast = useUIStore.getState().toast;
    expect(toast?.message).toBe('Test');
    expect(toast?.type).toBe('success');

    useUIStore.getState().hideToast();
    expect(useUIStore.getState().toast).toBeNull();
  });

  it('sets loading state', () => {
    useUIStore.getState().setLoading(true);
    expect(useUIStore.getState().loading).toBe(true);

    useUIStore.getState().setLoading(false);
    expect(useUIStore.getState().loading).toBe(false);
  });
});
