import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Board, BoardArgs, Pattern, UpdateBoardArg } from '@app/types';
import {
  LOCAL_STORAGE_PREFIX,
  MIN_SQUARE_COUNT,
} from '@app/constants';
import { convertArgsToString, createBoard, validateBoardPattern } from '@app/utils';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { useGroups } from '@hooks/useGroups';
import { useGames } from '@hooks/useGames';
import { useLocalStorage } from '@hooks/useLocalStorage';

const BOARD_ARGS_KEY = `${LOCAL_STORAGE_PREFIX}:boardArgs`;
const BOARD_KEY = `${LOCAL_STORAGE_PREFIX}:board`;

type GameBoardContextValue = {
  board: Board;
  boardArgs: BoardArgs;
  boardReady: boolean;
  squaresLoading: boolean;
  squaresError: boolean;
  loadBoard: (force?: boolean) => void;
  generateBoard: () => void;
  selectSquare: (row: number, col: number) => void;
  updateBoardArg: (args: UpdateBoardArg) => void;
  validateGameBoard: () => boolean;
};

const GameBoardContext = createContext<GameBoardContextValue | null>(null);

export function GameBoardProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { groups, defaultArgs, isLoading: groupsLoading } = useGroups();
  const { selectedGame } = useGames();

  const [boardArgs, setBoardArgs] = useLocalStorage<BoardArgs>(BOARD_ARGS_KEY, {} as BoardArgs);
  const [board, setBoard] = useLocalStorage<Board>(BOARD_KEY, []);
  const [seed, setSeed] = useState(0);
  // Start at -1 when no persisted board so the first data load triggers a build;
  // start at 0 when a board already exists so we don't clobber it on mount.
  const lastBuiltSeedRef = useRef(board.length > 0 ? 0 : -1);

  // Initialize boardArgs from defaultArgs on first load (no persisted value)
  useEffect(() => {
    if (!groupsLoading && Object.keys(defaultArgs).length && !Object.keys(boardArgs).length) {
      setBoardArgs(defaultArgs);
    }
  }, [groupsLoading, defaultArgs, boardArgs, setBoardArgs]);

  const enabled = !groupsLoading && Object.keys(boardArgs).length > 0;

  const { data: squares = [], isLoading: squaresLoading, isSuccess: squaresSuccess, isError: squaresFetchError } = useQuery({
    queryKey: ['squares', boardArgs, selectedGame?.id ?? null, seed],
    queryFn: async () => {
      const [includesStr, excludesStr] = convertArgsToString(boardArgs, groups);
      const params: { include?: string; exclude?: string } = {};
      if (includesStr) params.include = includesStr;
      if (excludesStr) params.exclude = excludesStr;
      const result = await apiClient.provide(Api.squares.list, params);
      return getData(result).items;
    },
    enabled,
  });

  // Build a new board only when seed differs from the last build (explicit user action),
  // or on first load when no persisted board exists (lastBuiltSeedRef starts at -1).
  useEffect(() => {
    if (squares.length >= MIN_SQUARE_COUNT && seed !== lastBuiltSeedRef.current) {
      lastBuiltSeedRef.current = seed;
      setBoard(createBoard(squares));
    }
  }, [squares, seed, setBoard]);

  const updateBoardArg = useCallback(
    (args: UpdateBoardArg) => {
      setBoardArgs((prev) => ({ ...prev, [args.groupName]: args.value }));
      setSeed((s) => s + 1);
    },
    [setBoardArgs, setSeed]
  );

  const loadBoard = useCallback(
    (force = false) => {
      if (Object.keys(defaultArgs).length) {
        setBoardArgs(defaultArgs);
        if (force) setSeed((s) => s + 1);
      }
    },
    [defaultArgs, setBoardArgs]
  );

  const generateBoard = useCallback(() => {
    setSeed((s) => s + 1);
  }, []);

  const selectSquare = useCallback(
    (row: number, col: number) => {
      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        const square = next[row][col];
        next[row][col] = { ...square, selected: !square.selected };
        return next;
      });
    },
    [setBoard]
  );

  const validateGameBoard = useCallback(() => {
    const patterns = selectedGame?.patterns ?? [];
    return (patterns as Pattern[]).some((pattern) => validateBoardPattern(board, pattern));
  }, [board, selectedGame]);

  const boardReady = board.length > 0;
  const squaresError = useMemo(
    () => squaresFetchError || (squaresSuccess && squares.length < MIN_SQUARE_COUNT),
    [squaresFetchError, squaresSuccess, squares]
  );

  const value = useMemo<GameBoardContextValue>(
    () => ({
      board,
      boardArgs,
      boardReady,
      squaresLoading,
      squaresError,
      loadBoard,
      generateBoard,
      selectSquare,
      updateBoardArg,
      validateGameBoard,
    }),
    [board, boardArgs, boardReady, squaresLoading, squaresError, loadBoard, generateBoard, selectSquare, updateBoardArg, validateGameBoard]
  );

  return (
    <GameBoardContext.Provider value={value}>
      {children}
    </GameBoardContext.Provider>
  );
}

export function useGameBoardContext(): GameBoardContextValue {
  const ctx = useContext(GameBoardContext);
  if (!ctx) throw new Error('useGameBoardContext must be used within GameBoardProvider');
  return ctx;
}
