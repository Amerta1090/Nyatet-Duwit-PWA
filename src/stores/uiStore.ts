import { create } from 'zustand';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  undo?: () => void;
}

interface UIState {
  bottomSheetOpen: boolean;
  bottomSheetContent: React.ReactNode | null;
  toast: ToastState | null;
  loading: boolean;
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info', undo?: () => void) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  bottomSheetOpen: false,
  bottomSheetContent: null,
  toast: null,
  loading: false,
  openBottomSheet: (content) => set({ bottomSheetOpen: true, bottomSheetContent: content }),
  closeBottomSheet: () => set({ bottomSheetOpen: false, bottomSheetContent: null }),
  showToast: (message, type, undo) => set({ toast: { message, type, undo } }),
  hideToast: () => set({ toast: null }),
  setLoading: (loading) => set({ loading }),
}));
