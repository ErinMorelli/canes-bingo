import {
  Board,
  BoardArgs,
  BoardSquare,
  Category,
  GroupsStateGroups,
  ImgurUploadResult,
  MultiGroup,
  Pattern,
  PatternSquare,
  SingleGroup,
  Square,
  Squares
} from './types';
import {
  ConfigKey, DEFAULT_PATTERN_SIZE,
  Group,
  IMGUR_CLIENT_ID,
  StorageKey
} from './constants';
import { apiClient, getData } from './api';
import { Api } from './api-endpoints';

function shuffleArray(arr: Squares): Squares {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chunkArray<T>(list: Array<T>, chunkSize = 5): Array<Array<T>> {
  return [...new Array(Math.ceil(list.length / chunkSize)).keys()].map(
    (_,i) => list.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
}

export function createBoard(squares: Squares, size = 25): Board {
  const filtered = squares.filter(s => s.active);
  const shuffled = shuffleArray(filtered).slice(0, size);
  const chunks = chunkArray<Square>(shuffled);
  return chunks.map((row): BoardSquare[] =>
    row.map((col): BoardSquare => ({
      selected: false,
      value: col,
    }))
  );
}

export function convertArgsToString(
  boardArgs: BoardArgs,
  groups: GroupsStateGroups
) {
  const includes = [
    Group.GENERAL,
    ...Group.SingleGroups.map((g: SingleGroup) => boardArgs[g].name),
  ].join(',');

  const excludeSingles = Group.SingleGroups
    .flatMap((g: SingleGroup) => groups[g]!.categories)
    .map((c: Category) => c.name)
    .filter((n) => !includes.includes(n));

  const excludes = [
    ...excludeSingles,
    ...Group.MultiGroups
      .filter((g: MultiGroup) => Object.keys(boardArgs).includes(g))
      .map((g: MultiGroup) => boardArgs[g])
      .flatMap((c: Array<Category>) => c.map(i => i.name))
  ].join(',');

  return [includes, excludes];
}

export async function fetchConfigValue(key: ConfigKey): Promise<string> {
  const result = await apiClient.provide(Api.config.get, { configId: key });
  return getData(result).value;
}

export async function fetchAllSquares(): Promise<Squares> {
  const result = await apiClient.provide(Api.squares.list, {});
  return getData(result).items;
}

function getStorageValue<T>(key: StorageKey): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setStorageValue<T>(key: StorageKey, value: T) {
  return localStorage.setItem(key, JSON.stringify(value));
}

export function initStorageValue<T>(key: StorageKey, defaultValue: T): T {
  let value = getStorageValue<T>(key);
  if (value === null) {
    value = defaultValue;
    setStorageValue(key, value);
  }
  return value;
}

export async function uploadImageToImgur(image: Blob): Promise<ImgurUploadResult | null> {
  const form = new FormData();
  form.append('image', image);

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
      body: form,
    });
    const result = await response.json() as ImgurUploadResult;
    return result.success ? result : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function parsePatternValue(value: string | PatternSquare[]): PatternSquare[] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
       const parsed = JSON.parse(value);
       return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  return value;
}

export function getSquareClasses(row: number, col: number, selected: PatternSquare[]): string {
  const classes = ['square'];
  classes.push(`square-${row}-${col}`);
  if (selected) {
    const isSelected = selected.some((s) => s.col === col && s.row === row);
    if (isSelected) classes.push('selected');
  }
  return classes.join(' ');
}

export function getSquareStyle(size?: number) {
  const s = size || DEFAULT_PATTERN_SIZE;
  return { width: `${s}px`, height: `${s}px` };
}

/**
 * Board square text fitting.
 *
 * Square labels are author-supplied and unbounded, while the cell is a fixed
 * 1:1 box, so a single long word ("ANDERSEN!") overflows at one fixed font
 * size — measurably so below ~430px, where 5 of 25 squares spilled outside
 * their cell. Rather than clip, step the size down until the longest word
 * fits, the way the redesign's `fitToWidth` does.
 *
 * Measuring is done on a shared 2D canvas context: it needs no layout pass, so
 * all 25 squares can be sized during render instead of after a reflow.
 */
let measureCtx: CanvasRenderingContext2D | null = null;

function measureWord(
  word: string,
  fontSize: number,
  weight: string,
  family: string
): number {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  if (!measureCtx) return 0;
  measureCtx.font = `${weight} ${fontSize}px ${family}`;
  return measureCtx.measureText(word).width;
}

export const SQUARE_FONT_FAMILY = "Inter, Arial, sans-serif";

/** Largest cell size that still gets the desktop type ladder. */
const COMPACT_CELL_MAX = 110;
const SIZES_REGULAR = [17, 16, 15, 14, 13, 12, 11, 10];
const SIZES_COMPACT = [14, 13, 12, 11, 10];

export type SquareFontFit = {
  fontSize: number;
  lineHeight: number;
};

/**
 * Pick a font size for `text` in a square `cellSize` px wide whose horizontal
 * padding totals `cellPadding`.
 *
 * `cellSize` of 0 means the board has not been measured yet — callers should
 * fall back to the stylesheet rather than guessing.
 */
export function fitSquareFont(
  text: string,
  cellSize: number,
  cellPadding: number,
  weight = '500'
): SquareFontFit | undefined {
  if (!cellSize) return undefined;

  const sizes = cellSize > COMPACT_CELL_MAX ? SIZES_REGULAR : SIZES_COMPACT;
  // `cellPadding` is the square's real computed padding, read from the DOM —
  // the stylesheet changes it at the breakpoint, so inferring it here would be
  // a second source of truth that silently drifts. The extra 6px keeps a
  // descender or a quote mark off the edge.
  const innerWidth = cellSize - cellPadding - 6;
  const innerHeight = cellSize - cellPadding - 6;

  const words = text.split(/\s+/).filter(Boolean);
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');

  const fits = sizes.find((size) => {
    if (measureWord(longestWord, size, weight, SQUARE_FONT_FAMILY) > innerWidth) {
      return false;
    }
    // A word that fits can still wrap to more lines than the cell is tall.
    // Dividing total text width by the line width would under-count: the
    // browser wraps greedily and leaves the tail of each line empty, so
    // "Two players drop gloves" takes four lines in a width that two would
    // fit if the text could be packed. Walk the same greedy wrap instead.
    const lineHeight = size + 4;
    const spaceWidth = measureWord(' ', size, weight, SQUARE_FONT_FAMILY);
    let lines = 1;
    let used = 0;
    for (const word of words) {
      const wordWidth = measureWord(word, size, weight, SQUARE_FONT_FAMILY);
      if (used === 0) {
        used = wordWidth;
      } else if (used + spaceWidth + wordWidth <= innerWidth) {
        used += spaceWidth + wordWidth;
      } else {
        lines += 1;
        used = wordWidth;
      }
    }
    return lines * lineHeight <= innerHeight;
  });

  const fontSize = fits ?? sizes[sizes.length - 1];
  return { fontSize, lineHeight: fontSize + 4 };
}

// The center of the 5x5 board is a free space: it counts as covered without
// ever being selected. createBoard does not mark it, so the rule lives here.
const FREE_SQUARE_ROW = 2;
const FREE_SQUARE_COL = 2;

function isSquareCovered(board: Board, { row, col }: PatternSquare): boolean {
  if (row === FREE_SQUARE_ROW && col === FREE_SQUARE_COL) return true;
  // Out-of-bounds squares read as undefined, so they stay uncovered and the
  // pattern can never complete.
  return board[row]?.[col]?.selected;
}

/**
 * How close the board is to completing a pattern.
 *
 * `remaining` is the number of pattern squares still to be selected; `valid` is
 * true only once a non-empty pattern is fully covered.
 *
 * A pattern with no squares is not completable, so it reports `remaining: -1`
 * rather than 0. Callers aggregating across patterns must drop that sentinel
 * before taking a minimum.
 */
export function validateBoardPattern(
  board: Board,
  pattern: Pattern
): { valid: boolean, remaining: number } {
  const squares = pattern.squares || [];
  if (squares.length === 0) return { valid: false, remaining: -1 };

  const remaining = squares.filter((square) => !isSquareCovered(board, square)).length;
  return { valid: remaining === 0, remaining };
}

export function squareKey({ row, col }: PatternSquare): string {
  return `${row}-${col}`;
}

/**
 * The four lines that run through the centre, as the pair of squares either
 * side of it: both diagonals, the middle row and the middle column.
 */
const CENTRE_NEIGHBOUR_PAIRS: Array<[PatternSquare, PatternSquare]> = [
  [{ row: 1, col: 1 }, { row: 3, col: 3 }],
  [{ row: 1, col: 3 }, { row: 3, col: 1 }],
  [{ row: 2, col: 1 }, { row: 2, col: 3 }],
  [{ row: 1, col: 2 }, { row: 3, col: 2 }],
];

/**
 * The squares to mark as the winning ones, which is not quite the pattern's own
 * square list.
 *
 * A pattern never lists the centre: it is covered for free, so including it
 * would be redundant to `validateBoardPattern`. But the free space is still
 * visibly *part* of a line drawn through the middle — leaving it unringed puts
 * a gap in the middle of the shape the player just completed.
 *
 * So the centre is added back when the pattern runs through it, which is true
 * exactly when the pattern holds both squares flanking the centre on one of the
 * four lines that cross it. That distinguishes the patterns that use the free
 * space (middle row, middle column, both diagonals, Plus, X, Blackout) from the
 * ones that merely surround it (Four Corners, Outline) — those contain corner
 * or edge squares but never a flanking pair.
 *
 * Checked against every pattern the API serves; see utils.test.ts.
 */
export function getWinningSquareKeys(pattern: Pattern): ReadonlySet<string> {
  const squares = pattern.squares || [];
  const keys = new Set(squares.map(squareKey));

  const centre = { row: FREE_SQUARE_ROW, col: FREE_SQUARE_COL };
  const runsThroughCentre = CENTRE_NEIGHBOUR_PAIRS.some(
    ([a, b]) => keys.has(squareKey(a)) && keys.has(squareKey(b))
  );
  if (runsThroughCentre) keys.add(squareKey(centre));

  return keys;
}
