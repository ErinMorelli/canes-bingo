import { describe, it, expect } from 'vitest';

import { patternBodySchema } from './pattern.validation';

describe('patternBodySchema', () => {
  it('parses valid JSON squares and returns PatternSquares', () => {
    const squares = [{ col: 0, row: 0 }, { col: 2, row: 4 }];
    const result = patternBodySchema.safeParse({ name: 'Test', squares: JSON.stringify(squares) });
    expect(result.success).toBe(true);
    expect(result.data?.squares).toEqual(squares);
  });

  it('returns parsed object, not the raw JSON string', () => {
    const squares = [{ col: 1, row: 1 }];
    const result = patternBodySchema.safeParse({ name: 'Test', squares: JSON.stringify(squares) });
    expect(result.success).toBe(true);
    expect(typeof result.data?.squares).toBe('object');
    expect(Array.isArray(result.data?.squares)).toBe(true);
  });

  it('rejects malformed JSON', () => {
    const result = patternBodySchema.safeParse({ name: 'Test', squares: 'not valid json{' });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error)).toContain('valid JSON');
  });

  it('rejects squares with wrong shape (missing row/col)', () => {
    const result = patternBodySchema.safeParse({ name: 'Test', squares: JSON.stringify([{ x: 0, y: 0 }]) });
    expect(result.success).toBe(false);
  });

  it('rejects squares that are not an array', () => {
    const result = patternBodySchema.safeParse({ name: 'Test', squares: JSON.stringify({ col: 0, row: 0 }) });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = patternBodySchema.safeParse({ name: '', squares: JSON.stringify([]) });
    expect(result.success).toBe(false);
  });

  it('accepts an empty squares array', () => {
    const result = patternBodySchema.safeParse({ name: 'Empty', squares: JSON.stringify([]) });
    expect(result.success).toBe(true);
    expect(result.data?.squares).toEqual([]);
  });
});
