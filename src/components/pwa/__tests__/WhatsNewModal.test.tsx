import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/hooks/useUpdateChecker', () => ({
  useUpdateChecker: vi.fn(),
}));

import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { WhatsNewModal } from '../WhatsNewModal';

function wrapper({ children }: { children: ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('WhatsNewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mock = useUpdateChecker as ReturnType<typeof vi.fn>;
    mock.mockReturnValue({
      showWhatsNew: false,
      whatsNewContent: '',
      dismissWhatsNew: vi.fn(),
    });
  });

  it('renders nothing when showWhatsNew is false', () => {
    const { container } = render(<WhatsNewModal />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when content is empty', () => {
    const mock = useUpdateChecker as ReturnType<typeof vi.fn>;
    mock.mockReturnValue({
      showWhatsNew: true,
      whatsNewContent: '',
      dismissWhatsNew: vi.fn(),
    });
    const { container } = render(<WhatsNewModal />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with changelog content when available', () => {
    const mock = useUpdateChecker as ReturnType<typeof vi.fn>;
    mock.mockReturnValue({
      showWhatsNew: true,
      whatsNewContent: '- Fitur baru A\n- Fitur baru B',
      dismissWhatsNew: vi.fn(),
    });
    render(<WhatsNewModal />, { wrapper });

    expect(screen.getByText('Apa yang Baru')).toBeInTheDocument();
    expect(screen.getByText('Fitur terbaru')).toBeInTheDocument();
    expect(screen.getByText('- Fitur baru A')).toBeInTheDocument();
    expect(screen.getByText('- Fitur baru B')).toBeInTheDocument();
    expect(screen.getByText('Mulai')).toBeInTheDocument();
  });

  it('calls dismissWhatsNew when Mulai is clicked', async () => {
    const dismissWhatsNew = vi.fn();
    const mock = useUpdateChecker as ReturnType<typeof vi.fn>;
    mock.mockReturnValue({
      showWhatsNew: true,
      whatsNewContent: '- Fitur baru',
      dismissWhatsNew,
    });
    render(<WhatsNewModal />, { wrapper });
    const user = userEvent.setup();

    await user.click(screen.getByText('Mulai'));
    expect(dismissWhatsNew).toHaveBeenCalledOnce();
  });
});
