import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const MOCK_CURRENT = { version: '1.0.0', buildTime: '2024-01-01T00:00:00.000Z' };
const MOCK_NEW = {
  version: '2.0.0',
  buildTime: '2024-06-01T00:00:00.000Z',
  changelog: '- Fitur baru A\n- Perbaikan bug B',
  forceUpdate: false,
};

function mockFetch(data: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }),
  );
}

async function importHook() {
  const mod = await import('../useUpdateChecker');
  return mod.useUpdateChecker;
}

describe('useUpdateChecker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.resetModules();
  });

  it('detects no update on first load with no last seen', async () => {
    mockFetch(MOCK_CURRENT);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(false));
  });

  it('detects new version via interval check', async () => {
    // First load — sets cached version
    mockFetch(MOCK_CURRENT);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(false));

    // Switch response to new version
    mockFetch(MOCK_NEW);
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 60 + 100);
    });

    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(true));
    expect(result.current.latestVersion?.version).toBe('2.0.0');
  });

  it('shows What\'s New when version changed since last visit', async () => {
    localStorage.setItem('nyatetduwit_last_seen_version', '1.0.0');
    mockFetch(MOCK_NEW);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.showWhatsNew).toBe(true));
    expect(result.current.whatsNewContent).toBe(MOCK_NEW.changelog);
  });

  it('does not show What\'s New on first ever visit', async () => {
    localStorage.removeItem('nyatetduwit_last_seen_version');
    mockFetch(MOCK_CURRENT);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.showWhatsNew).toBe(false));
  });

  it('does not show What\'s New if already dismissed for that version', async () => {
    localStorage.setItem('nyatetduwit_last_seen_version', '1.0.0');
    localStorage.setItem('nyatetduwit_whatsnew_dismissed', '2.0.0');
    mockFetch(MOCK_NEW);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.showWhatsNew).toBe(false));
  });

  it('handles fetch failure gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(false));
    expect(result.current.latestVersion).toBeNull();
  });

  it('marks update as force update when flag is set', async () => {
    mockFetch(MOCK_CURRENT);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(false));

    mockFetch({ ...MOCK_NEW, forceUpdate: true });
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 60 + 100);
    });
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(true));
    expect(result.current.latestVersion?.forceUpdate).toBe(true);
  });

  it('dismiss hides the update banner', async () => {
    mockFetch(MOCK_CURRENT);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(false));

    mockFetch(MOCK_NEW);
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 60 + 100);
    });
    await vi.waitFor(() => expect(result.current.updateAvailable).toBe(true));

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.updateAvailable).toBe(false);
  });

  it('dismissWhatsNew hides modal and persists dismissal', async () => {
    localStorage.setItem('nyatetduwit_last_seen_version', '1.0.0');
    mockFetch(MOCK_NEW);
    const useUpdateChecker = await importHook();
    const { result } = renderHook(() => useUpdateChecker());
    await vi.waitFor(() => expect(result.current.showWhatsNew).toBe(true));

    act(() => {
      result.current.dismissWhatsNew();
    });
    expect(result.current.showWhatsNew).toBe(false);
    expect(localStorage.getItem('nyatetduwit_whatsnew_dismissed')).toBe('2.0.0');
  });
});
