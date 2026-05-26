import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Amount" />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="Wajib diisi" />);
    expect(screen.getByText('Wajib diisi')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Input helperText="Masukkan nominal" />);
    expect(screen.getByText('Masukkan nominal')).toBeInTheDocument();
  });
});
