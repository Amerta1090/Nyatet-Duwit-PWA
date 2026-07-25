import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/db/repositories/budgetRepository', () => ({
  budgetRepo: {
    ensureActiveCycle: vi.fn(),
    getTotalBudget: vi.fn(),
  },
}));

vi.mock('@/db/repositories/transactionRepository', () => ({
  transactionRepo: {
    getByDateRange: vi.fn(),
  },
}));

vi.mock('@/utils/cn', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

import { DailyBudgetCard } from '../DailyBudgetCard';
import { budgetRepo } from '@/db/repositories/budgetRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { CYCLE_DAYS } from '@/types/budgeting';
import { startOfDay } from 'date-fns';

function renderCard() {
  return render(
    <MemoryRouter>
      <DailyBudgetCard />
    </MemoryRouter>
  );
}

describe('DailyBudgetCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when totalBudget is0', async () => {
    const cycleStart = startOfDay(Date.now()).getTime();
    const cycleEnd = cycleStart + (CYCLE_DAYS - 1) * 86400000 + 86399999;
    vi.mocked(budgetRepo.ensureActiveCycle).mockResolvedValue({ cycleStart, cycleEnd, isNew: false });
    vi.mocked(budgetRepo.getTotalBudget).mockResolvedValue({ totalBudget: 0, totalSpent: 0, totalPercent: 0 });
    vi.mocked(transactionRepo.getByDateRange).mockResolvedValue([]);

    const { container } = renderCard();
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('shows daily budget info when budget exists', async () => {
    const cycleStart = startOfDay(Date.now()).getTime();
    const cycleEnd = cycleStart + (CYCLE_DAYS - 1) * 86400000 + 86399999;
    vi.mocked(budgetRepo.ensureActiveCycle).mockResolvedValue({ cycleStart, cycleEnd, isNew: false });
    vi.mocked(budgetRepo.getTotalBudget).mockResolvedValue({ totalBudget: 60000, totalSpent: 5000, totalPercent: 8 });
    vi.mocked(transactionRepo.getByDateRange).mockResolvedValue([]);

    await act(async () => {
      renderCard();
    });

    await waitFor(() => {
      expect(screen.getByText('Budget Hari Ini')).toBeTruthy();
    });
  });

  it('shows cycle date range at bottom', async () => {
    const cycleStart = startOfDay(Date.now()).getTime();
    const cycleEnd = cycleStart + (CYCLE_DAYS - 1) * 86400000 + 86399999;
    vi.mocked(budgetRepo.ensureActiveCycle).mockResolvedValue({ cycleStart, cycleEnd, isNew: false });
    vi.mocked(budgetRepo.getTotalBudget).mockResolvedValue({ totalBudget: 60000, totalSpent: 0, totalPercent: 0 });
    vi.mocked(transactionRepo.getByDateRange).mockResolvedValue([]);

    await act(async () => {
      renderCard();
    });

    await waitFor(() => {
      expect(screen.getByText(/Siklus:/)).toBeTruthy();
    });
  });
});
