import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateRelative } from '../format';

describe('formatCurrency', () => {
  it('formats IDR correctly', () => {
    expect(formatCurrency(15000)).toBe('Rp 15.000');
  });

  it('formats millions correctly', () => {
    expect(formatCurrency(1500000)).toBe('Rp 1.500.000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-25000)).toBe('Rp 25.000');
  });
});

describe('formatDateRelative', () => {
  it('returns "Hari ini" for today', () => {
    expect(formatDateRelative(Date.now())).toBe('Hari ini');
  });

  it('returns "Kemarin" for yesterday', () => {
    const yesterday = Date.now() - 86400000;
    expect(formatDateRelative(yesterday)).toBe('Kemarin');
  });
});
