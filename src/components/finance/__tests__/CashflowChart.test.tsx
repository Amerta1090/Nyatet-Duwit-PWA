import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CashflowChart } from '../CashflowChart';

describe('CashflowChart', () => {
  it('renders empty state when no data', () => {
    render(<CashflowChart data={[]} />);
    expect(screen.getByText('Belum ada data bulanan')).toBeDefined();
  });

  it('renders chart with monthly data', () => {
    const data = [
      { month: 0, year: 2025, income: 5000000, expense: 3000000 },
      { month: 1, year: 2025, income: 6000000, expense: 3500000 },
      { month: 2, year: 2025, income: 5500000, expense: 2800000 },
    ];
    const { container } = render(<CashflowChart data={data} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('shows averages', () => {
    const data = [
      { month: 0, year: 2025, income: 5000000, expense: 3000000 },
      { month: 1, year: 2025, income: 7000000, expense: 4000000 },
    ];
    render(<CashflowChart data={data} />);
    expect(screen.getByText(/Rata-rata Pemasukan/)).toBeDefined();
    expect(screen.getByText(/Rata-rata Pengeluaran/)).toBeDefined();
    expect(screen.getByText(/Rata-rata Bersih/)).toBeDefined();
  });
});
