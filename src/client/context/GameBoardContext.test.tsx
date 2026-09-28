// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import type { Game, Pattern, Squares } from '@app/types';

/**
 * The provider reaches the network through react-query, so the mock stands in
 * for the request and — crucially for these tests — for its *latency*. Dealing
 * a new card bumps the seed, which changes the query key, which empties
 * `squares` until the refetch lands. `servedSeeds` is that gate: a seed the
 * test has not served yet behaves exactly like a request still in flight.
 */
const servedSeeds = new Set<number>([0]);

const SQUARES: Squares = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  value: `Square ${i + 1}`,
  description: null,
  active: true,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, enabled }: { queryKey: unknown[]; enabled?: boolean }) => {
    const seed = queryKey[3] as number;
    const ready = Boolean(enabled) && servedSeeds.has(seed);
    return {
      data: ready ? SQUARES : undefined,
      isLoading: !ready,
      isSuccess: ready,
      isError: false,
    };
  },
}));

vi.mock('@app/api', () => ({ apiClient: { provide: vi.fn() }, getData: vi.fn() }));
vi.mock('@app/api-endpoints', () => ({ Api: {} }));

vi.mock('@hooks/useGroups', () => ({
  useGroups: () => ({
    groups: {},
    // Non-empty, or the provider never enables the query.
    defaultArgs: { location: { id: 1, name: 'home', label: 'Home' } },
    isLoading: false,
  }),
}));

/** The centre is free, so a middle row needs only these four. */
const MIDDLE_ROW: Pattern = {
  id: 7,
  name: 'Horizontal Line 3',
  squares: [
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 2, col: 4 },
  ],
};

const ANY_FIVE = { id: 1, name: 'Any Five', isDefault: true, patterns: [MIDDLE_ROW] } as unknown as Game;
const BLACKOUT = { id: 2, name: 'Blackout', patterns: [] } as unknown as Game;

const setSelectedGame = vi.fn();
let selectedGame: Game = ANY_FIVE;

vi.mock('@hooks/useGames', () => ({
  useGames: () => ({
    games: [ANY_FIVE, BLACKOUT],
    selectedGame,
    gamesLoaded: true,
    isEnabled: true,
    setSelectedGame,
  }),
}));

import { GameBoardProvider } from './GameBoardContext';
import { useGameBoard } from '@hooks/useGameBoard';
import { flushStorageWrites } from '@hooks/useLocalStorage';

function mount() {
  return renderHook(() => useGameBoard(), { wrapper: GameBoardProvider });
}

/** Marks the four squares that complete the middle row. */
function winMiddleRow(result: { current: ReturnType<typeof useGameBoard> }) {
  act(() => {
    result.current.selectSquare(2, 0);
    result.current.selectSquare(2, 1);
    result.current.selectSquare(2, 3);
    result.current.selectSquare(2, 4);
  });
}

describe('GameBoardProvider win state', () => {
  beforeEach(() => {
    flushStorageWrites();
    localStorage.clear();
    servedSeeds.clear();
    servedSeeds.add(0);
    selectedGame = ANY_FIVE;
    setSelectedGame.mockClear();
  });

  it('reports a win once the pattern is covered', () => {
    const { result } = mount();
    expect(result.current.hasWon).toBe(false);

    winMiddleRow(result);
    expect(result.current.hasWon).toBe(true);
    expect(result.current.winningPattern?.id).toBe(MIDDLE_ROW.id);
  });

  it('rings the free centre, because the middle row runs through it', () => {
    const { result } = mount();
    winMiddleRow(result);
    expect([...result.current.winningSquares].sort())
      .toEqual(['2-0', '2-1', '2-2', '2-3', '2-4']);
  });

  it('does not re-fire the win when another square is marked afterwards', () => {
    const { result } = mount();
    winMiddleRow(result);
    const pattern = result.current.winningPattern;

    act(() => result.current.selectSquare(0, 0));

    // Same win throughout — the old bug reset a `hasWon` flag on every board
    // change, which let the celebration run again on the next tap.
    expect(result.current.hasWon).toBe(true);
    expect(result.current.winningPattern).toBe(pattern);
  });

  it('drops the win and its rings when dismissed', () => {
    const { result } = mount();
    winMiddleRow(result);

    act(() => result.current.dismissWin());

    expect(result.current.hasWon).toBe(false);
    expect(result.current.winningSquares.size).toBe(0);
    // The pattern is still covered; only the celebration was waved off.
    expect(result.current.winningPattern?.id).toBe(MIDDLE_ROW.id);
  });

  /**
   * The regression this file exists for: dismiss, then deal a new card. The
   * seed bumps at once but the board cannot be replaced until the refetch
   * lands, so for that window the winning board is still mounted. Clearing the
   * dismissal on the seed un-dismissed it there, which brought the bar back
   * and fired the cannons again before the new card had even loaded.
   */
  it('keeps a dismissed win dismissed while the new card is still loading', () => {
    const { result } = mount();
    winMiddleRow(result);
    act(() => result.current.dismissWin());
    expect(result.current.hasWon).toBe(false);

    // Deal a new card, but leave the request in flight.
    act(() => result.current.generateBoard());

    expect(result.current.hasWon).toBe(false);
    expect(result.current.winningSquares.size).toBe(0);
  });

  it('clears the dismissal once the new card actually arrives', () => {
    const { result, rerender } = mount();
    winMiddleRow(result);
    act(() => result.current.dismissWin());
    act(() => result.current.generateBoard());

    // The refetch lands and the board is replaced.
    act(() => { servedSeeds.add(1); });
    rerender();

    // Fresh board, nothing marked, so no win — and the dismissal is spent, so
    // completing the same pattern again will celebrate.
    expect(result.current.hasWon).toBe(false);
    expect(result.current.winningPattern).toBeNull();

    winMiddleRow(result);
    expect(result.current.hasWon).toBe(true);
  });

  it('offers the blackout escalation, and moves to it keeping every daub', () => {
    const { result } = mount();
    winMiddleRow(result);
    expect(result.current.canKeepPlaying).toBe(true);

    const marked = result.current.board.flat().filter((s) => s.selected).length;
    act(() => result.current.keepPlaying());

    expect(setSelectedGame).toHaveBeenCalledWith(BLACKOUT);
    expect(result.current.board.flat().filter((s) => s.selected)).toHaveLength(marked);
  });

  it('has nothing to escalate to once blackout is the game being played', () => {
    selectedGame = BLACKOUT;
    const { result } = mount();
    expect(result.current.canKeepPlaying).toBe(false);
  });

  it('counts daubs, so a win restored from a previous session can skip the confetti', () => {
    const { result } = mount();
    expect(result.current.daubCount).toBe(0);

    winMiddleRow(result);
    expect(result.current.daubCount).toBe(4);
  });
});
