import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useQuery } from '@tanstack/react-query';

import { Board, BoardArgs, Pattern, UpdateBoardArg } from '@app/types';
import {
  BLACKOUT_GAME_NAME,
  LOCAL_STORAGE_PREFIX,
  MIN_SQUARE_COUNT,
} from '@app/constants';
import {
  convertArgsToString,
  createBoard,
  getWinningSquareKeys,
  validateBoardPattern,
} from '@app/utils';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { useGroups } from '@hooks/useGroups';
import { useGames } from '@hooks/useGames';
import { useLocalStorage } from '@hooks/useLocalStorage';

import { GameBoardContext, GameBoardContextValue } from './contexts';

const BOARD_ARGS_KEY = `${LOCAL_STORAGE_PREFIX}:boardArgs`;
const BOARD_KEY = `${LOCAL_STORAGE_PREFIX}:board`;

/** Shared so "no win" is a stable reference and cannot re-render the board. */
const EMPTY_KEYS: ReadonlySet<string> = new Set<string>();
const NO_DISMISSALS: ReadonlySet<number> = new Set<number>();
const NO_PATTERNS: Pattern[] = [];

export function GameBoardProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { groups, defaultArgs, isLoading: groupsLoading } = useGroups();
  const { games, selectedGame, isEnabled, setSelectedGame } = useGames();

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
      // Cleared here rather than when `seed` changed — see the note on
      // `dismissedPatternId` below.
      setDismissedPatternIds(NO_DISMISSALS);
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

  /**
   * How many squares have been marked since the page loaded.
   *
   * The board is persisted, so a reload can arrive with a completed pattern
   * already on it. The win bar belongs on screen for that, but the confetti
   * should not go off again for a win the player already watched — and "did
   * this win arrive on a tap" cannot be answered by timing, because the game
   * list is fetched and the win therefore surfaces a beat after mount. A count
   * of actual daubs answers it directly.
   */
  const [daubCount, setDaubCount] = useState(0);

  const selectSquare = useCallback(
    (row: number, col: number) => {
      setDaubCount((n) => n + 1);
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

  /**
   * The win is *derived* from the board rather than latched into state.
   *
   * It used to be a `hasWon` flag in Card, reset by an effect that listed
   * `board` as a dependency — so every tap after a win cleared the flag and let
   * the detection effect fire the whole celebration again. Reading the win off
   * the board instead means there is no flag to fall out of step: marking a
   * 25th square cannot resurrect a win that is already on screen, and the
   * celebration keys off the transition rather than the flag.
   */
  /** Every pattern the board currently satisfies, in the game's own order. */
  const completedPatterns = useMemo(() => {
    if (!isEnabled) return NO_PATTERNS;
    const patterns = (selectedGame?.patterns ?? []) as Pattern[];
    return patterns.filter((pattern) => validateBoardPattern(board, pattern).valid);
  }, [board, isEnabled, selectedGame]);

  /**
   * Which wins the player has waved off, by pattern id.
   *
   * A *set*, not a single id. With one id — and a `find` that returned the
   * first completed pattern regardless — dismissing a line and then
   * completing a second one never celebrated the second: the first was still
   * what `find` returned, and it was still the dismissed one. Any Five has
   * twelve patterns and they overlap, so completing a second is ordinary.
   */
  const [dismissedPatternIds, setDismissedPatternIds] = useState<ReadonlySet<number>>(NO_DISMISSALS);

  /** The completed pattern still worth celebrating, if there is one. */
  const winningPattern = useMemo(
    () => completedPatterns.find((pattern) => !dismissedPatternIds.has(pattern.id)) ?? null,
    [completedPatterns, dismissedPatternIds]
  );

  /*
    A change of game starts a fresh contest, so a previous dismissal no longer
    applies. Deliberately not keyed on `board`: that is the mistake the derived
    win above exists to avoid.

    Nor on `seed`. Dealing a new card bumps the seed immediately, but the board
    is only replaced once the refetch it triggers comes back — the query key
    holds the seed, so `squares` empties and the build effect waits. Clearing
    the dismissal on the seed therefore un-dismissed a win while the board that
    won it was still on screen, which brought the bar back and fired the
    cannons a second time before the new card arrived. The clear belongs with
    the board swap, so it happens in the build effect above instead.
  */
  useEffect(() => {
    setDismissedPatternIds(NO_DISMISSALS);
  }, [isEnabled, selectedGame?.id]);

  // `winningPattern` is already the *undismissed* one, so there is nothing
  // further to subtract here.
  const hasWon = winningPattern !== null;

  // The rings belong to the win being celebrated, so waving the bar away
  // takes them with it rather than leaving a decorated board behind while
  // the blackout is chased.
  const winningSquares = useMemo(
    () => (winningPattern ? getWinningSquareKeys(winningPattern) : EMPTY_KEYS),
    [winningPattern]
  );

  const blackoutGame = useMemo(
    () => games.find((game) => game.name === BLACKOUT_GAME_NAME),
    [games]
  );

  const canKeepPlaying = Boolean(blackoutGame) && selectedGame?.id !== blackoutGame?.id;

  const dismissWin = useCallback(() => {
    if (!winningPattern) return;
    setDismissedPatternIds((prev) => new Set(prev).add(winningPattern.id));
  }, [winningPattern]);

  /**
   * Raise the bar rather than end the game: the board keeps every daub and only
   * the target changes, so the squares already marked count towards the
   * coverall. Switching `selectedGame` re-derives `winningPattern` against
   * Blackout's 24 squares, which clears the win on its own — no reset needed.
   */
  const keepPlaying = useCallback(() => {
    if (blackoutGame) setSelectedGame(blackoutGame);
  }, [blackoutGame, setSelectedGame]);

  const value = useMemo<GameBoardContextValue>(
    () => ({
      board,
      boardArgs,
      boardReady,
      cardDirty,
      squaresLoading,
      squaresError,
      squaresRemaining,
      winningPattern,
      hasWon,
      winningSquares,
      canKeepPlaying,
      daubCount,
      loadBoard,
      generateBoard,
      selectSquare,
      updateBoardArg,
      validateGameBoard,
      dismissWin,
      keepPlaying,
    }),
    [board, boardArgs, boardReady, cardDirty, squaresLoading, squaresError, squaresRemaining, winningPattern, hasWon, winningSquares, canKeepPlaying, daubCount, loadBoard, generateBoard, selectSquare, updateBoardArg, validateGameBoard, dismissWin, keepPlaying]
  );

  return (
    <GameBoardContext.Provider value={value}>
      {children}
    </GameBoardContext.Provider>
  );
}

