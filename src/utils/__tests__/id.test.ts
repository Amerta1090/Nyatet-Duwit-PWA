import { describe, it, expect } from 'vitest';
import { generateId } from '../id';

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('returns unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('matches UUID format', () => {
    const uuidRegex = /^[0-9a-f-]{36}$/;
    expect(uuidRegex.test(generateId())).toBe(true);
  });
});
