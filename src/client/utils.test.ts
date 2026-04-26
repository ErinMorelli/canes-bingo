// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

vi.mock('./api.ts', () => ({ apiClient: { provide: vi.fn() }, getData: vi.fn() }));
vi.mock('./api-endpoints.ts', () => ({ Api: {} }));

import {
  parsePatternValue,
  getSquareClasses,
  getSquareStyle,
  validateBoardPattern,
  createBoard,
} from './utils.ts';
import type { Board, Pattern, Square, Squares } from './types.ts';

// --- helpers ---

function makeSquare(id: number, active = true): Square {
  return { id, value: `Square ${id}`, description: null, active };
}

function makeSquares(count: number, active = true): Squares {
  return Array.from({ length: count }, (_, i) => makeSquare(i + 1, active));
}

// --- parsePatternValue ---

describe('parsePatternValue', () => {
  it('returns an empty array for falsy input', () => {
    expect(parsePatternValue('')).toEqual([]);
  });

  it('parses a valid JSON string into PatternSquares', () => {
    const squares = [{ col: 0, row: 0 }, { col: 2, row: 4 }];
    expect(parsePatternValue(JSON.stringify(squares))).toEqual(squares);
  });

  it('returns an empty array for malformed JSON', () => {
    expect(parsePatternValue('not-json{')).toEqual([]);
  });

  it('returns an empty array when JSON is not an array', () => {
    expect(parsePatternValue(JSON.stringify({ col: 0, row: 0 }))).toEqual([]);
  });

  it('passes through an existing PatternSquare array unchanged', () => {
    const squares = [{ col: 1, row: 2 }];
    expect(parsePatternValue(squares)).toEqual(squares);
  });
});

// --- getSquareClasses ---

describe('getSquareClasses', () => {
  it('includes the base square class and position class', () => {
    const cls = getSquareClasses(1, 2, []);
    expect(cls).toContain('square');
    expect(cls).toContain('square-1-2');
  });

  it('adds "selected" when the square is in the selected list', () => {
    const cls = getSquareClasses(0, 0, [{ col: 0, row: 0 }]);
    expect(cls).toContain('selected');
  });

  it('does not add "selected" when the square is not in the list', () => {
    const cls = getSquareClasses(0, 0, [{ col: 1, row: 1 }]);
    expect(cls).not.toContain('selected');
  });
});

// --- getSquareStyle ---

describe('getSquareStyle', () => {
  it('uses the provided size', () => {
    expect(getSquareStyle(60)).toEqual({ width: '60px', height: '60px' });
  });

  it('falls back to DEFAULT_PATTERN_SIZE (50) when no size given', () => {
    expect(getSquareStyle()).toEqual({ width: '50px', height: '50px' });
  });
});

// --- validateBoardPattern ---

describe('validateBoardPattern', () => {
  const board: Board = [
    [{ selected: true, value: makeSquare(1) }, { selected: false, value: makeSquare(2) }],
    [{ selected: true, value: makeSquare(3) }, { selected: true,  value: makeSquare(4) }],
  ];

  it('returns true when all pattern squares are selected', () => {
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }] };
    expect(validateBoardPattern(board, pattern)).toBe(true);
  });

  it('returns false when a pattern square is not selected', () => {
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 1 }] };
    expect(validateBoardPattern(board, pattern)).toBe(false);
  });

  it('returns false for an empty squares list', () => {
    const pattern: Pattern = { id: 1, name: 'empty', squares: [] };
    expect(validateBoardPattern(board, pattern)).toBe(false);
  });

  it('returns false when a pattern square is out of bounds', () => {
    const pattern: Pattern = { id: 1, name: 'oob', squares: [{ row: 9, col: 9 }] };
    expect(validateBoardPattern(board, pattern)).toBe(false);
  });
});

// --- createBoard ---

describe('createBoard', () => {
  it('creates a 5×5 board (25 squares) from enough active squares', () => {
    const board = createBoard(makeSquares(30));
    expect(board).toHaveLength(5);
    expect(board[0]).toHaveLength(5);
  });

  it('only includes active squares', () => {
    const squares = [...makeSquares(20, true), ...makeSquares(10, false)];
    const board = createBoard(squares);
    board.flat().forEach((cell) => expect(cell.value.active).toBe(true));
  });

  it('initialises every cell with selected: false', () => {
    const board = createBoard(makeSquares(30));
    board.flat().forEach((cell) => expect(cell.selected).toBe(false));
  });

  it('respects a custom size', () => {
    const board = createBoard(makeSquares(10), 9);
    expect(board.flat()).toHaveLength(9);
  });
});
