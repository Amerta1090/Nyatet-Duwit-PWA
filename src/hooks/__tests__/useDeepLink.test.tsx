import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

const mockNavigate = vi.fn();
let mockSearchParams: URLSearchParams;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

async function importHook() {
  const mod = await import('../useDeepLink');
  return mod.useDeepLink;
}

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useDeepLink', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('calls onAddTransaction when action=add without category', async () => {
    mockSearchParams = new URLSearchParams('action=add');
    const onAddTransaction = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction }), { wrapper });
    await vi.waitFor(() => expect(onAddTransaction).toHaveBeenCalledOnce());
  });

  it('calls onAddWithCategory when action=add with known category', async () => {
    mockSearchParams = new URLSearchParams('action=add&category=food');
    const onAddTransaction = vi.fn();
    const onAddWithCategory = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction, onAddWithCategory }), { wrapper });
    await vi.waitFor(() => {
      expect(onAddWithCategory).toHaveBeenCalledWith('cat-food');
    });
    expect(onAddTransaction).not.toHaveBeenCalled();
  });

  it('navigates to root when action=dashboard', async () => {
    mockSearchParams = new URLSearchParams('action=dashboard');
    const onAddTransaction = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction }), { wrapper });
    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });

  it('navigates to /insights when action=insights', async () => {
    mockSearchParams = new URLSearchParams('action=insights');
    const onAddTransaction = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction }), { wrapper });
    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/insights', { replace: true }));
  });

  it('does nothing for unknown action', async () => {
    mockSearchParams = new URLSearchParams('action=unknown');
    const onAddTransaction = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction }), { wrapper });
    await vi.waitFor(() => {
      expect(onAddTransaction).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('ignores unknown category and falls back to onAddTransaction', async () => {
    mockSearchParams = new URLSearchParams('action=add&category=unknown');
    const onAddTransaction = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction }), { wrapper });
    await vi.waitFor(() => expect(onAddTransaction).toHaveBeenCalledOnce());
  });

  it('maps multiple category keys correctly', async () => {
    mockSearchParams = new URLSearchParams('action=add&category=transport');
    const onAddWithCategory = vi.fn();
    const useDeepLink = await importHook();

    renderHook(() => useDeepLink({ onAddTransaction: vi.fn(), onAddWithCategory }), { wrapper });
    await vi.waitFor(() => expect(onAddWithCategory).toHaveBeenCalledWith('cat-transport'));
  });
});
