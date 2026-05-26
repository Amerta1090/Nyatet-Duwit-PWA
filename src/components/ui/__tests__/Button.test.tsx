import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Test</Button>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Test</Button>);
    const button = screen.getByText('Test').closest('button');
    expect(button).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(<Button variant="danger">Hapus</Button>);
    const button = screen.getByText('Hapus').closest('button');
    expect(button?.className).toContain('bg-danger-500');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Klik</Button>);
    await userEvent.click(screen.getByText('Klik'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
