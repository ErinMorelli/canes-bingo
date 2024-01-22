import axios from 'axios';

import {
  Board,
  BoardArgs,
  BoardSquare,
  Category,
  FetchGroupResult,
  GroupResult,
  MultiGroup,
  SingleGroup,
  Square,
  Squares
} from './types.ts';
import { API_PREFIX, Group, StorageKey } from './constants.ts';

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
  const shuffled = shuffleArray(squares).slice(0, size);
  const chunks = chunkArray<Square>(shuffled);
  return chunks.map((row): BoardSquare[] =>
    row.map((col): BoardSquare => ({
      selected: false,
      value: col,
    }))
  );
}

export function convertArgsToString(boardArgs: BoardArgs) {
  const includes = [
    Group.GENERAL,
    ...Group.SingleGroups.map((g: SingleGroup) => boardArgs[g].name),
  ].join(',');

  const excludes = Group.MultiGroups
    .filter((g: MultiGroup) => Object.keys(boardArgs).includes(g))
    .map((g: MultiGroup) => boardArgs[g])
    .map((c: Array<Category>) => c.map(i => i.name))
    .flat()
    .join(',');

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

export async function fetchConfigValue(key: string): Promise<string> {
  return await axios
    .get(`${API_PREFIX}/config/${key}`)
    .then((res: { data: { value: string }}) => res.data.value);
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
