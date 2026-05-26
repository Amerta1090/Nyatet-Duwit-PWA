import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('removes falsy values', () => {
    const falsy = false as boolean;
    expect(cn('px-4', falsy && 'hidden', 'py-2')).toBe('px-4 py-2');
  });

  it('handles tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});
