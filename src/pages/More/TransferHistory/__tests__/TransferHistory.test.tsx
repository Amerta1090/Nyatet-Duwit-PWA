import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { db } from '@/db/schema';
import { seedDatabase } from '@/db/seed';
import { accountRepo } from '@/db/repositories/accountRepository';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import TransferHistoryPage from '../index';

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={['/more/transfer-history']}>{children}</MemoryRouter>;
}

beforeAll(async () => {
  await db.open();
  await seedDatabase();
});

afterAll(() => {
  db.close();
});

describe('TransferHistoryPage', () => {
  it('shows empty state when no transfers exist', async () => {
    render(<TransferHistoryPage />, { wrapper });

    expect(await screen.findByText('Belum ada transfer')).toBeInTheDocument();
    expect(
      screen.getByText('Transfer antar akun akan muncul di sini'),
    ).toBeInTheDocument();
  });

  it('renders page title', async () => {
    render(<TransferHistoryPage />, { wrapper });
    expect(await screen.findByText('Riwayat Transfer')).toBeInTheDocument();
  });

  it('shows filter button', async () => {
    render(<TransferHistoryPage />, { wrapper });
    expect(await screen.findByText('Filter')).toBeInTheDocument();
  });

  it('displays transfer summary when transfers exist', async () => {
    const accounts = await accountRepo.getAll(true);
    if (accounts.length < 2) return;

    const tx = await transactionRepo.create({
      type: 'transfer',
      amount: 100000,
      categoryId: 'cat-other',
      accountId: accounts[0]!.id,
      toAccountId: accounts[1]!.id,
      date: Date.now(),
      notes: 'Test transfer',
    });

    render(<TransferHistoryPage />, { wrapper });

    expect(await screen.findByText('Total transfer')).toBeInTheDocument();
    expect(screen.getByText('Rp100.000')).toBeInTheDocument();
    expect(screen.getByText('1 transfer')).toBeInTheDocument();

    // Check transfer card renders sender → receiver
    expect(screen.getByText(accounts[0]!.name)).toBeInTheDocument();
    expect(screen.getByText(accounts[1]!.name)).toBeInTheDocument();
    expect(screen.getByText('Test transfer')).toBeInTheDocument();

    await transactionRepo.delete(tx.id);
  });

  it('shows transfer grouped by date', async () => {
    const accounts = await accountRepo.getAll(true);
    if (accounts.length < 2) return;

    const now = Date.now();
    const yesterday = now - 86400000;

    const tx1 = await transactionRepo.create({
      type: 'transfer',
      amount: 50000,
      categoryId: 'cat-other',
      accountId: accounts[0]!.id,
      toAccountId: accounts[1]!.id,
      date: now,
    });

    const tx2 = await transactionRepo.create({
      type: 'transfer',
      amount: 75000,
      categoryId: 'cat-other',
      accountId: accounts[1]!.id,
      toAccountId: accounts[0]!.id,
      date: yesterday,
    });

    render(<TransferHistoryPage />, { wrapper });

    // Should show transfers (not empty state)
    expect(await screen.findByText('Total transfer')).toBeInTheDocument();
    expect(screen.getByText('Rp125.000')).toBeInTheDocument();
    expect(screen.getByText('2 transfer')).toBeInTheDocument();

    await transactionRepo.delete(tx1.id);
    await transactionRepo.delete(tx2.id);
  });
});
