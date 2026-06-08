import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpendingTrendChart, movingAverage } from '../SpendingTrendChart';

describe('movingAverage', () => {
  it('returns empty array if data length < window', () => {
    const data = [{ date: 1, total: 100 }];
    expect(movingAverage(data, 7)).toEqual([]);
  });

  it('calculates 3-day moving average correctly', () => {
    const data = [
      { date: 1, total: 10 },
      { date: 2, total: 20 },
      { date: 3, total: 30 },
      { date: 4, total: 40 },
    ];
    const result = movingAverage(data, 3);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: 3, value: 20 });
    expect(result[1]).toEqual({ date: 4, value: 30 });
  });

  it('handles zero values', () => {
    const data = [
      { date: 1, total: 0 },
      { date: 2, total: 0 },
      { date: 3, total: 0 },
      { date: 4, total: 0 },
      { date: 5, total: 0 },
    ];
    const result = movingAverage(data, 3);
    expect(result.every((r) => r.value === 0)).toBe(true);
  });

  it('handles large numbers', () => {
    const data = [
      { date: 1, total: 1_000_000 },
      { date: 2, total: 2_000_000 },
      { date: 3, total: 3_000_000 },
    ];
    const result = movingAverage(data, 3);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2_000_000);
  });

  it('handles window size equal to data length', () => {
    const data = [
      { date: 1, total: 10 },
      { date: 2, total: 20 },
      { date: 3, total: 30 },
    ];
    const result = movingAverage(data, 3);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(20);
  });
});

describe('SpendingTrendChart', () => {
  it('renders empty state when no data', () => {
    render(<SpendingTrendChart data={[]} />);
    expect(screen.getByText('Belum cukup data untuk grafik trend')).toBeDefined();
  });

  it('renders chart with data', () => {
    const data = [
      { date: Date.now() - 86400000 * 2, total: 50000 },
      { date: Date.now() - 86400000, total: 75000 },
      { date: Date.now(), total: 30000 },
    ];
    const { container } = render(<SpendingTrendChart data={data} days={3} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('renders legend items', () => {
    const data = [
      { date: Date.now() - 86400000 * 2, total: 50000 },
      { date: Date.now() - 86400000, total: 75000 },
      { date: Date.now(), total: 30000 },
    ];
    render(<SpendingTrendChart data={data} days={3} />);
    expect(screen.getByText('Pengeluaran harian')).toBeDefined();
    expect(screen.getByText('Rata-rata 7 hari')).toBeDefined();
  });

  it('renders compare legend when compareData provided', () => {
    const data = [
      { date: Date.now() - 86400000 * 2, total: 50000 },
      { date: Date.now(), total: 30000 },
    ];
    const compareData = [
      { date: Date.now() - 86400000 * 5, total: 40000 },
      { date: Date.now() - 86400000 * 3, total: 60000 },
    ];
    render(<SpendingTrendChart data={data} compareData={compareData} days={3} />);
    expect(screen.getByText('Periode sebelumnya')).toBeDefined();
  });
});
