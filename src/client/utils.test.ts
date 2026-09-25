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

  it('is valid with nothing remaining when all pattern squares are selected', () => {
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }] };
    expect(validateBoardPattern(board, pattern)).toEqual({ valid: true, remaining: 0 });
  });

  it('counts a single unselected square as one remaining', () => {
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 1 }] };
    expect(validateBoardPattern(board, pattern)).toEqual({ valid: false, remaining: 1 });
  });

  it('counts only the squares still needed, not the whole pattern', () => {
    // (0,0) and (1,1) are selected; (0,1) is not.
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }] };
    expect(validateBoardPattern(board, pattern)).toEqual({ valid: false, remaining: 1 });
  });

  it('counts every missing square', () => {
    const emptyBoard: Board = [
      [{ selected: false, value: makeSquare(1) }, { selected: false, value: makeSquare(2) }],
      [{ selected: false, value: makeSquare(3) }, { selected: false, value: makeSquare(4) }],
    ];
    const pattern: Pattern = { id: 1, name: 'X', squares: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }] };
    expect(validateBoardPattern(emptyBoard, pattern)).toEqual({ valid: false, remaining: 3 });
  });

  it('treats the centre square as a free space that needs no selection', () => {
    const fiveByFive: Board = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, (_, col) => ({ selected: false, value: makeSquare(col) }))
    );
    const pattern: Pattern = { id: 1, name: 'free', squares: [{ row: 2, col: 2 }] };
    expect(validateBoardPattern(fiveByFive, pattern)).toEqual({ valid: true, remaining: 0 });
  });

  it('does not count the free centre toward remaining', () => {
    const fiveByFive: Board = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, (_, col) => ({ selected: false, value: makeSquare(col) }))
    );
    const pattern: Pattern = { id: 1, name: 'row', squares: [{ row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }] };
    expect(validateBoardPattern(fiveByFive, pattern)).toEqual({ valid: false, remaining: 2 });
  });

  it('reports -1 for an empty squares list, which is not a completable pattern', () => {
    const pattern: Pattern = { id: 1, name: 'empty', squares: [] };
    expect(validateBoardPattern(board, pattern)).toEqual({ valid: false, remaining: -1 });
  });

  it('never completes when a pattern square is out of bounds', () => {
    const pattern: Pattern = { id: 1, name: 'oob', squares: [{ row: 9, col: 9 }] };
    expect(validateBoardPattern(board, pattern)).toEqual({ valid: false, remaining: 1 });
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
