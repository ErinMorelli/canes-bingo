// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import type { Category, Game, NHLScheduleGame, NHLScheduleTeam, Squares } from '@app/types';

/**
 * Covers the precedence chain the auto-detected options rest on:
 *
 *   database default  <  derived from tonight's game  <  the player's override
 *
 * Kept apart from `GameBoardContext.test.tsx` because that file's fixtures
 * exist to drive the win sequence and deliberately hand back an empty
 * `groups` map, which is exactly the input that makes derivation impossible.
 */

const SQUARES: Squares = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  value: `Square ${i + 1}`,
  description: null,
  active: true,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ enabled }: { enabled?: boolean }) => ({
    data: enabled ? SQUARES : undefined,
    isLoading: !enabled,
    isSuccess: Boolean(enabled),
    isError: false,
  }),
}));

vi.mock('@app/api', () => ({ apiClient: { provide: vi.fn() }, getData: vi.fn() }));
vi.mock('@app/api-endpoints', () => ({ Api: {} }));

const HOME: Category = { id: 15, name: 'home', label: 'Home' } as Category;
const AWAY: Category = { id: 16, name: 'away', label: 'Away' } as Category;
const AHO: Category = { id: 9, name: 'aho', label: 'Sebastian Aho #20' } as Category;
const SVECH: Category = { id: 8, name: 'svech', label: 'Andrei Svechnikov #37' } as Category;
const TRIPP: Category = { id: 6, name: 'tripp', label: 'Tripp Tracy' } as Category;

vi.mock('@hooks/useGroups', () => ({
  useGroups: () => ({
    groups: {
      location: { name: 'location', label: 'Game Location', categories: [HOME, AWAY] },
      players: { name: 'players', label: 'Players', categories: [AHO, SVECH] },
      bally: { name: 'bally', label: 'Crew', categories: [TRIPP] },
    },
    // `home` is the database default — the thing detection has to override.
    defaultArgs: { location: HOME },
    isLoading: false,
  }),
}));

vi.mock('@hooks/useGames', () => ({
  useGames: () => ({
    games: [],
    selectedGame: { id: 1, name: 'Any Five', patterns: [] } as unknown as Game,
    gamesLoaded: true,
    isEnabled: true,
    setSelectedGame: vi.fn(),
  }),
}));

/** The published scratch list under test, swapped per case. */
let scratchList: { gameId: number; ids: number[] } | null = null;

vi.mock('@hooks/useConfig', () => ({
  useConfig: () => ({ scratchList }),
}));

/** The schedule answer under test, swapped per case. */
let nextGame: { game: NHLScheduleGame | null; settled: boolean } = { game: null, settled: true };

vi.mock('@hooks/useNextGame', () => ({
  useNextGame: () => nextGame,
}));

import { GameBoardProvider } from './GameBoardContext';
import { useGameBoard } from '@hooks/useGameBoard';
import { flushStorageWrites } from '@hooks/useLocalStorage';

function scheduleGame(id: number, home: string, away: string): NHLScheduleGame {
  return {
    id,
    gameType: 2,
    gameDate: '2026-09-29',
    startTimeUTC: '2026-09-29T21:00:00Z',
    venueUTCOffset: '-04:00',
    venueTimezone: 'US/Eastern',
    gameState: 'FUT',
    gameScheduleState: 'OK',
    homeTeam: { abbrev: home } as NHLScheduleTeam,
    awayTeam: { abbrev: away } as NHLScheduleTeam,
  };
}

function mount() {
  return renderHook(() => useGameBoard(), { wrapper: GameBoardProvider });
}

beforeEach(() => {
  /*
    Drain before clearing.

    `useLocalStorage` buffers writes in a module-level `pending` map and
    `readValue` returns from it *before* touching storage, so a write left
    over from the previous test survives `localStorage.clear()` and is handed
    back to the next mount. Without this the migration cases below never
    exercise the migration at all — they read the previous test's overrides
    and pass for the wrong reason.
  */
  flushStorageWrites();
  localStorage.clear();
  nextGame = { game: null, settled: true };
  scratchList = null;
});

describe('auto-detected game options', () => {
  it('uses the database default when the schedule has no answer', () => {
    nextGame = { game: null, settled: true };
    const { result } = mount();
    expect(result.current.boardArgs.location).toEqual(HOME);
    expect(result.current.autoGroups.has('location')).toBe(false);
  });

  it('derives Away for a road game, overriding the database default of Home', () => {
    nextGame = { game: scheduleGame(2026020003, 'PHI', 'CAR'), settled: true };
    const { result } = mount();
    expect(result.current.boardArgs.location).toEqual(AWAY);
    expect(result.current.autoGroups.has('location')).toBe(true);
  });

  it('marks a home game as auto too, so the hint reflects provenance not value', () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    const { result } = mount();
    expect(result.current.boardArgs.location).toEqual(HOME);
    // Same value as the default, but it is now an answer rather than a guess.
    expect(result.current.autoGroups.has('location')).toBe(true);
  });

  it("lets the player's choice beat the derived value", () => {
    nextGame = { game: scheduleGame(2026020003, 'PHI', 'CAR'), settled: true };
    const { result } = mount();
    expect(result.current.boardArgs.location).toEqual(AWAY);

    act(() => {
      result.current.updateBoardArg({ groupName: 'location', value: HOME });
    });

    expect(result.current.boardArgs.location).toEqual(HOME);
    // The hint must clear, or it would claim the player's pick came from the API.
    expect(result.current.autoGroups.has('location')).toBe(false);
  });

  it('returns to the derived value on Reset, not to the database default', () => {
    nextGame = { game: scheduleGame(2026020003, 'PHI', 'CAR'), settled: true };
    const { result } = mount();

    act(() => {
      result.current.updateBoardArg({ groupName: 'location', value: HOME });
    });
    expect(result.current.boardArgs.location).toEqual(HOME);

    act(() => {
      result.current.loadBoard(true);
    });

    // The whole point: Reset lands on Away, where the old behaviour would
    // have restored Home and quietly undone the detection.
    expect(result.current.boardArgs.location).toEqual(AWAY);
    expect(result.current.autoGroups.has('location')).toBe(true);
  });

  it('drops the previous game\'s override when the game changes', async () => {
    nextGame = { game: scheduleGame(2026020003, 'PHI', 'CAR'), settled: true };
    const first = mount();

    act(() => {
      first.result.current.updateBoardArg({ groupName: 'location', value: HOME });
    });
    expect(first.result.current.boardArgs.location).toEqual(HOME);
    act(() => { flushStorageWrites(); });
    first.unmount();

    // Next night, a home game. The correction was about the road game.
    nextGame = { game: scheduleGame(2026020004, 'CAR', 'BOS'), settled: true };
    const second = mount();

    expect(second.result.current.boardArgs.location).toEqual(HOME);
    expect(second.result.current.autoGroups.has('location')).toBe(true);
  });

  it('clears scratches when the game changes, since they are published per game', () => {
    nextGame = { game: scheduleGame(2026020003, 'PHI', 'CAR'), settled: true };
    const first = mount();

    act(() => {
      first.result.current.updateBoardArg({ groupName: 'players', value: [AHO] });
    });
    expect(first.result.current.boardArgs.players).toEqual([AHO]);
    act(() => { flushStorageWrites(); });
    first.unmount();

    // A correction made for Tuesday must not suppress Wednesday's published
    // list. The player can scratch again for the night they are watching.
    nextGame = { game: scheduleGame(2026020004, 'CAR', 'BOS'), settled: true };
    const second = mount();

    expect(second.result.current.boardArgs.players).toBeUndefined();
  });

  // --- the admin's published list ---

  it('applies a list published for tonight', () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id, TRIPP.id] };
    const { result } = mount();

    expect(result.current.boardArgs.players).toEqual([AHO]);
    expect(result.current.boardArgs.bally).toEqual([TRIPP]);
    expect(result.current.autoGroups.has('players')).toBe(true);
  });

  /*
    The failure people actually make is forgetting to clear a list, not
    forgetting to set one — so a list from the last game has to stop applying
    by itself.
  */
  it('ignores a list published for a different game', () => {
    nextGame = { game: scheduleGame(2026020004, 'CAR', 'BOS'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id] };
    const { result } = mount();

    expect(result.current.boardArgs.players).toBeUndefined();
    expect(result.current.autoGroups.has('players')).toBe(false);
  });

  it('ignores a published list when no game is scheduled', () => {
    nextGame = { game: null, settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id] };
    const { result } = mount();

    expect(result.current.boardArgs.players).toBeUndefined();
  });

  /*
    A list naming only players resolves to nothing for the crew. Writing an
    empty array there would still count as a derived value and light the
    "Auto" badge on a roster with nobody scratched.
  */
  it('leaves a roster untouched when the list names nobody in it', () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id] };
    const { result } = mount();

    expect(result.current.boardArgs.players).toEqual([AHO]);
    expect(result.current.boardArgs.bally).toBeUndefined();
    expect(result.current.autoGroups.has('bally')).toBe(false);
  });

  it('resolves only ids that exist as categories', () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id, 9999] };
    const { result } = mount();

    expect(result.current.boardArgs.players).toEqual([AHO]);
  });

  it("lets the player's scratches beat the published list", () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id, SVECH.id] };
    const { result } = mount();
    expect(result.current.boardArgs.players).toEqual([AHO, SVECH]);

    act(() => {
      result.current.updateBoardArg({ groupName: 'players', value: [SVECH] });
    });

    expect(result.current.boardArgs.players).toEqual([SVECH]);
    expect(result.current.autoGroups.has('players')).toBe(false);
  });

  it('returns to the published list on Reset', () => {
    nextGame = { game: scheduleGame(2026020001, 'CAR', 'FLA'), settled: true };
    scratchList = { gameId: 2026020001, ids: [AHO.id] };
    const { result } = mount();

    act(() => {
      result.current.updateBoardArg({ groupName: 'players', value: [] });
    });
    act(() => {
      result.current.loadBoard(true);
    });

    expect(result.current.boardArgs.players).toEqual([AHO]);
    expect(result.current.autoGroups.has('players')).toBe(true);
  });
});
