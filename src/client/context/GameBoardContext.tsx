import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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

import { GameBoardContext, GameBoardContextValue } from './contexts';

const BOARD_ARGS_KEY = `${LOCAL_STORAGE_PREFIX}:boardArgs`;
const BOARD_KEY = `${LOCAL_STORAGE_PREFIX}:board`;

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

  /**
   * Whether the options have moved on from the card currently on screen.
   *
   * Location and broadcast change which squares are *eligible*, so they cannot
   * apply to a board that has already been dealt — the drawer has always said
   * "Generate a new card to apply them", but the old behaviour regenerated
   * immediately, which both contradicted that copy and threw away a card
   * mid-game on a stray tap. Changing an option now stages it and marks the
   * card stale; only Generate or Reset deals a new one.
   */
  const [cardDirty, setCardDirty] = useState(false);

  const updateBoardArg = useCallback(
    (args: UpdateBoardArg) => {
      setBoardArgs((prev) => ({ ...prev, [args.groupName]: args.value }));
      setCardDirty(true);
    },
    [setBoardArgs]
  );

  const loadBoard = useCallback(
    (force = false) => {
      if (Object.keys(defaultArgs).length) {
        setBoardArgs(defaultArgs);
        if (force) {
          setSeed((s) => s + 1);
          setCardDirty(false);
        }
      }
    },
    [defaultArgs, setBoardArgs]
  );

  const generateBoard = useCallback(() => {
    setSeed((s) => s + 1);
    setCardDirty(false);
  }, []);

  const selectSquare = useCallback(
    (row: number, col: number) => {
      // Marking a square has to paint on the click that caused it. `setBoard`
      // reaches React through a useSyncExternalStore subscription, and store
      // notifications are scheduled at default priority — unlike a plain
      // setState in a discrete event, they do not get the synchronous flush,
      // so the daub landed a scheduler tick (15-35ms) after the tap. This is
      // the one call site where that is visible, and it is only ever called
      // from the square's own click handler, never from render or an effect.
      flushSync(() => {
        setBoard((prev) => {
          const next = prev.map((r) => [...r]);
          const square = next[row][col];
          next[row][col] = { ...square, selected: !square.selected };
          return next;
        });
      });
    },
    [setBoard]
  );

  const validateGameBoard = useCallback(() => {
    const patterns = selectedGame?.patterns ?? [];
    return (patterns as Pattern[]).some((pattern) => validateBoardPattern(board, pattern).valid);
  }, [board, selectedGame]);

  const boardReady = board.length > 0;
  const squaresError = useMemo(
    () => squaresFetchError || (squaresSuccess && squares.length < MIN_SQUARE_COUNT),
    [squaresFetchError, squaresSuccess, squares]
  );

  const squaresRemaining = useMemo(() => {
    const patterns = selectedGame?.patterns ?? [];
    const counts = (patterns as Pattern[])
      .map((pattern) => validateBoardPattern(board, pattern).remaining)
      // Drop the "not completable" sentinel, or one empty pattern wins the min
      // and the board reports -1 while real patterns are still in progress.
      .filter((remaining) => remaining >= 0);
    return counts.length ? Math.min(...counts) : -1;
  }, [board, selectedGame]);

  const value = useMemo<GameBoardContextValue>(
    () => ({
      board,
      boardArgs,
      boardReady,
      cardDirty,
      squaresLoading,
      squaresError,
      squaresRemaining,
      loadBoard,
      generateBoard,
      selectSquare,
      updateBoardArg,
      validateGameBoard,
    }),
    [board, boardArgs, boardReady, cardDirty, squaresLoading, squaresError, squaresRemaining, loadBoard, generateBoard, selectSquare, updateBoardArg, validateGameBoard]
  );

  return (
    <GameBoardContext.Provider value={value}>
      {children}
    </GameBoardContext.Provider>
  );
}

