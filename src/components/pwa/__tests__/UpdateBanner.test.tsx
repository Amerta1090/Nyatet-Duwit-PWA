import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/hooks/useUpdateChecker', () => ({
  useUpdateChecker: vi.fn(),
}));

import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { UpdateBanner } from '../UpdateBanner';

function wrapper({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

function mockHook(overrides: Record<string, unknown> = {}) {
  const mock = useUpdateChecker as ReturnType<typeof vi.fn>;
  mock.mockReturnValue({
    updateAvailable: true,
    latestVersion: { version: '2.0.0', changelog: '- Fix A\n- Fix B' },
    reload: vi.fn(),
    dismiss: vi.fn(),
    ...overrides,
  });
}

describe('UpdateBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no update', () => {
    mockHook({ updateAvailable: false });
    const { container } = render(<UpdateBanner />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('shows update banner when update available', () => {
    mockHook();
    render(<UpdateBanner />, { wrapper });
    expect(screen.getByText(/Versi 2\.0\.0 tersedia/i)).toBeInTheDocument();
    expect(screen.getByText('Muat ulang')).toBeInTheDocument();
  });

  it('shows dismiss button for non-force update', () => {
    mockHook();
    render(<UpdateBanner />, { wrapper });
    expect(screen.getByLabelText('Tutup')).toBeInTheDocument();
  });

  it('hides dismiss button for force update', () => {
    mockHook({ latestVersion: { version: '2.0.0', forceUpdate: true } });
    render(<UpdateBanner />, { wrapper });
    expect(screen.queryByLabelText('Tutup')).not.toBeInTheDocument();
    expect(screen.getByText(/Update wajib tersedia/i)).toBeInTheDocument();
  });

  it('toggles changelog details', async () => {
    mockHook();
    render(<UpdateBanner />, { wrapper });
    const user = userEvent.setup();

    expect(screen.getByText('Lihat perubahan')).toBeInTheDocument();

    await user.click(screen.getByText('Lihat perubahan'));
    expect(screen.getByText('Tutup perubahan')).toBeInTheDocument();
    expect(screen.getByText('- Fix A')).toBeInTheDocument();
    expect(screen.getByText('- Fix B')).toBeInTheDocument();

    await user.click(screen.getByText('Tutup perubahan'));
    expect(screen.queryByText('- Fix A')).not.toBeInTheDocument();
  });

  it('calls reload on button click', async () => {
    const reload = vi.fn();
    mockHook({ reload });
    render(<UpdateBanner />, { wrapper });
    const user = userEvent.setup();

    await user.click(screen.getByText('Muat ulang'));
    expect(reload).toHaveBeenCalledOnce();
  });

  it('calls dismiss on close button click', async () => {
    const dismiss = vi.fn();
    mockHook({ dismiss });
    render(<UpdateBanner />, { wrapper });
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Tutup'));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('does not show changelog toggle when no changelog', () => {
    mockHook({ latestVersion: { version: '2.0.0' } });
    render(<UpdateBanner />, { wrapper });
    expect(screen.queryByText('Lihat perubahan')).not.toBeInTheDocument();
  });
});
