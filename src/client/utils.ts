import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';

import {
  Board,
  BoardArgs,
  BoardSquare,
  Category,
  FetchGroupResult,
  GroupResult,
  GroupsStateGroups,
  ImgurUploadResult,
  MultiGroup, Pattern, Patterns, PatternSquare,
  SingleGroup,
  Square,
  Squares
} from './types.ts';
import {
  API_PREFIX,
  ConfigKey, DEFAULT_PATTERN_SIZE,
  Group,
  IMGUR_CLIENT_ID,
  StorageKey
} from './constants.ts';

function shuffleArray(arr: Squares): Squares {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chunkArray<T>(list: Array<T>, chunkSize = 5): Array<Array<T>> {
  return [...Array(Math.ceil(list.length / chunkSize))].map(
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
    .map((g: SingleGroup) => groups[g]!.categories)
    .flat()
    .map((c: Category) => c.name)
    .filter((n) => !includes.includes(n));

  const excludes = [
    ...excludeSingles,
    ...Group.MultiGroups
      .filter((g: MultiGroup) => Object.keys(boardArgs).includes(g))
      .map((g: MultiGroup) => boardArgs[g])
      .map((c: Array<Category>) => c.map(i => i.name))
      .flat()
  ].join(',');

  return [includes, excludes];
}

export async function fetchGroup(groupName: string): Promise<FetchGroupResult> {
  return await axios
    .get(`${API_PREFIX}/groups/${groupName}`)
    .then((res: { data: GroupResult }) => ({
      group: res.data,
      groupName
    }));
}

export async function fetchConfigValue(key: ConfigKey): Promise<string> {
  return await axios
    .get(`${API_PREFIX}/config/${key}`)
    .then((res: { data: { value: string }}) => res.data.value);
}

export async function fetchAllSquares(): Promise<Squares> {
  return await axios.get(`${API_PREFIX}/squares`)
    .then((res) => res.data);
}

export async function fetchAllPatterns(): Promise<Patterns> {
  return await axios.get(`${API_PREFIX}/patterns`)
    .then((res) => res.data);
}

export function getStorageValue<T>(key: StorageKey): T | null {
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

export function removeStorageValue(key: StorageKey) {
  return localStorage.removeItem(key);
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

  return await axios({
    method: 'POST',
    url: 'https://api.imgur.com/3/image',
    headers: {
      Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      'Content-Type': 'multipart/form-data;',
    },
    data: form
  })
    .then((res: AxiosResponse<ImgurUploadResult>) => {
      return res.data.success ? res.data : null;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
}

export function parsePatternValue(value: string | PatternSquare[]): PatternSquare[] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
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

export function validateBoardPattern(board: Board, pattern: Pattern): boolean {
  const squares = pattern.squares || [];
  return squares.every(({ row, col }) => {
    return board[row]?.[col]?.selected;
  });
}
