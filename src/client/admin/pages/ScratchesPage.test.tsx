// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';

import type { NHLScheduleGame, NHLScheduleTeam } from '@app/types';

/**
 * Covers the seeding rule, which is the only real logic on this page: which
 * game's ticks are on screen, and what happens when that game changes under
 * an open tab.
 */

type Row = { key: string; value: string };

let configItems: Row[] = [];
let scheduleGame: NHLScheduleGame | null = null;
let savePending = false;

const GROUPS = [
  { name: 'players', categories: [
    { id: 9, label: 'Sebastian Aho #20' },
    { id: 8, label: 'Andrei Svechnikov #37' },
  ] },
  { name: 'bally', categories: [{ id: 6, label: 'Tripp Tracy' }] },
];

/*
  One mock for three different queries, told apart by their key. The page runs
  config, groups and schedule side by side and the seeding rule depends on all
  three having settled.
*/
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, select }: { queryKey: unknown[]; select?: (d: unknown) => unknown }) => {
    const which = queryKey[1];
    if (which === 'config') return { data: configItems, isLoading: false, isError: false };
    if (which === 'groups') return { data: GROUPS, isLoading: false, isError: false };
    // schedule — `select` is what turns the payload into one game
    const data = select ? select({ games: scheduleGame ? [scheduleGame] : [] }) : scheduleGame;
    return { data, isLoading: false, isError: false };
  },
  useMutation: () => ({ mutate: vi.fn(), isPending: savePending }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@app/api', () => ({ apiClient: { provide: vi.fn() }, getData: vi.fn() }));
vi.mock('@app/api-endpoints', () => ({ Api: { config: {}, groups: {} } }));

import { ScratchesPage } from './ScratchesPage';

function game(id: number): NHLScheduleGame {
  return {
    id,
    gameType: 2,
    gameDate: '2026-09-29',
    startTimeUTC: '2026-09-29T21:00:00Z',
    venueUTCOffset: '-04:00',
    venueTimezone: 'US/Eastern',
    gameState: 'FUT',
    gameScheduleState: 'OK',
    homeTeam: { abbrev: 'CAR' } as NHLScheduleTeam,
    awayTeam: { abbrev: 'FLA' } as NHLScheduleTeam,
  };
}

function published(gameId: number, ids: number[]): Row[] {
  return [{ key: 'scratches', value: JSON.stringify({ gameId, ids }) }];
}

/** Which boxes are ticked, by label. */
function ticked(): string[] {
  return screen.getAllByRole('checkbox')
    .filter((box) => (box as HTMLInputElement).checked)
    .map((box) => box.closest('label')?.textContent?.trim() ?? '');
}

beforeEach(() => {
  cleanup();
  // The page picks today's (or the next) game, so pin the clock to the
  // fixture's game day or the fixture ages out of the schedule.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-29T12:00:00Z'));
  configItems = [];
  scheduleGame = null;
  savePending = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ScratchesPage seeding', () => {
  // This page had never been rendered before these tests existed.
  it('renders the rosters', () => {
    scheduleGame = game(2026020001);
    render(<ScratchesPage />);
    expect(screen.getByText('Players')).toBeDefined();
    expect(screen.getByText('Broadcast crew')).toBeDefined();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('ticks the boxes from a list published for tonight', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9, 6]);
    render(<ScratchesPage />);
    expect(ticked().sort()).toEqual(['Sebastian Aho #20', 'Tripp Tracy']);
  });

  it('ignores a list published for a different game', () => {
    scheduleGame = game(2026020004);
    configItems = published(2026020001, [9]);
    render(<ScratchesPage />);
    expect(ticked()).toEqual([]);
    expect(screen.getByText('The saved list belongs to an earlier game')).toBeDefined();
  });

  /*
    The bug the game-keyed seed exists for. The schedule query refetches on
    window focus, so a page left open overnight swaps to the next game — and
    a seed that only ever ran once would leave last night's ticks on screen
    under the new game's header, ready to be published against its id.
  */
  it('reseeds when the game changes under an open page', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    const view = render(<ScratchesPage />);
    expect(ticked()).toEqual(['Sebastian Aho #20']);

    // Next night. Same stale config row, new game.
    act(() => { scheduleGame = game(2026020004); });
    view.rerender(<ScratchesPage />);

    expect(ticked()).toEqual([]);
  });

  it('picks up the new game\'s own published list', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    const view = render(<ScratchesPage />);
    expect(ticked()).toEqual(['Sebastian Aho #20']);

    act(() => {
      scheduleGame = game(2026020004);
      configItems = published(2026020004, [8]);
    });
    view.rerender(<ScratchesPage />);

    expect(ticked()).toEqual(['Andrei Svechnikov #37']);
  });

  it('clears the ticks when there is no game to pin them to', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    const view = render(<ScratchesPage />);
    expect(ticked()).toEqual(['Sebastian Aho #20']);

    act(() => { scheduleGame = null; });
    view.rerender(<ScratchesPage />);

    expect(ticked()).toEqual([]);
    expect(screen.getByText('No game scheduled')).toBeDefined();
  });

  /*
    Publishing invalidates the config query, so `stored` changes identity
    while the game stays put. Reseeding on that would throw away the edit
    that was just published.
  */
  it('does not reseed when only the config refetches', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    const view = render(<ScratchesPage />);

    // A fresh row object with the same content, as a refetch produces.
    act(() => { configItems = published(2026020001, [9, 8]); });
    view.rerender(<ScratchesPage />);

    // Still the originally seeded selection, not the refetched one.
    expect(ticked()).toEqual(['Sebastian Aho #20']);
  });

  /*
    Clearing empties the ticks, which disables this button on its own — but
    only until a box is ticked again, and the publish behind it may still be
    in flight.
  */
  it('disables Clear while a publish is still in flight', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    savePending = true;
    render(<ScratchesPage />);

    const clear = screen.getByRole('button', { name: /Clear/ }) as HTMLButtonElement;
    expect(clear.disabled).toBe(true);
  });

  it('leaves Clear available once the publish has settled', () => {
    scheduleGame = game(2026020001);
    configItems = published(2026020001, [9]);
    savePending = false;
    render(<ScratchesPage />);

    const clear = screen.getByRole('button', { name: /Clear/ }) as HTMLButtonElement;
    expect(clear.disabled).toBe(false);
  });

  it('disables publishing when there is no game', () => {
    scheduleGame = null;
    render(<ScratchesPage />);
    const publish = screen.getByRole('button', { name: /Publish/ }) as HTMLButtonElement;
    expect(publish.disabled).toBe(true);
  });
});
