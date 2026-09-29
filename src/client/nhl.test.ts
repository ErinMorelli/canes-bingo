import { describe, it, expect } from 'vitest';

import {
  FALLBACK_GAME,
  POLL_ACTIVE,
  POLL_IDLE,
  POLL_INTERMISSION,
  POLL_PREGAME,
  getGameState,
  isGameToday,
  isPeriodActive,
  pollInterval,
  selectTodaysGame,
  deriveLocation,
} from './nhl';
import { NHLGameState } from './types';
import type { NHLActiveGame, NHLScheduleGame, NHLScheduleResult } from './types';

// --- helpers ---

// Built from local date parts so the assertions hold in any TZ the suite runs in.
function localDate(y: number, m: number, d: number, h = 0, min = 0): Date {
  return new Date(y, m - 1, d, h, min);
}

function makeGame(overrides: Partial<NHLActiveGame> = {}): NHLActiveGame {
  return { ...FALLBACK_GAME, ...overrides };
}

function makeClock(overrides: Partial<NHLActiveGame['clock']> = {}): NHLActiveGame['clock'] {
  return { timeRemaining: '12:34', secondsRemaining: 754, running: true, inIntermission: false, ...overrides };
}

function makeSchedule(games: Array<Partial<NHLScheduleGame>>): NHLScheduleResult {
  return { games: games as Array<NHLScheduleGame> };
}

// --- isGameToday ---

describe('isGameToday', () => {
  it('counts a late west-coast start as today even though its UTC date is tomorrow', () => {
    // 6pm PT on Sep 24 is 01:00Z on Sep 25 — the case that broke UTC comparison.
    const game = { gameDate: '2026-09-24', startTimeUTC: '2026-09-25T01:00:00Z' } as NHLScheduleGame;
    expect(game.startTimeUTC.split('T')[0]).toBe('2026-09-25'); // UTC date really does differ
    expect(isGameToday(game, localDate(2026, 9, 24, 22, 0))).toBe(true);
  });

  it('counts an early evening home game as today', () => {
    const game = { gameDate: '2026-09-24', startTimeUTC: '2026-09-24T23:00:00Z' } as NHLScheduleGame;
    expect(isGameToday(game, localDate(2026, 9, 24, 19, 30))).toBe(true);
  });

  it('does not count tomorrow"s game as today', () => {
    const game = { gameDate: '2026-09-26', startTimeUTC: '2026-09-26T19:00:00Z' } as NHLScheduleGame;
    expect(isGameToday(game, localDate(2026, 9, 25, 12, 0))).toBe(false);
  });

  it('is false when gameDate is missing, as on the fallback game', () => {
    expect(isGameToday(FALLBACK_GAME, localDate(2026, 9, 25))).toBe(false);
  });
});

// --- selectTodaysGame ---

describe('selectTodaysGame', () => {
  // Dates are spaced several days apart so the "past vs upcoming" assertions
  // survive the +14/-11 range of real UTC offsets.
  const schedule = makeSchedule([
    { id: 1, gameDate: '2026-09-20', startTimeUTC: '2026-09-20T23:00:00Z' },
    { id: 2, gameDate: '2026-09-26', startTimeUTC: '2026-09-26T19:00:00Z' },
    { id: 3, gameDate: '2026-09-29', startTimeUTC: '2026-09-29T21:00:00Z' },
  ]);

  it('prefers a game happening today', () => {
    expect(selectTodaysGame(schedule, localDate(2026, 9, 26, 9, 0))?.id).toBe(2);
  });

  it('falls back to the next upcoming game on an off day', () => {
    expect(selectTodaysGame(schedule, localDate(2026, 9, 23, 12, 0))?.id).toBe(2);
  });

  it('still returns today"s game after it has finished', () => {
    expect(selectTodaysGame(schedule, localDate(2026, 9, 20, 23, 59))?.id).toBe(1);
  });

  it('returns null once the schedule is exhausted', () => {
    expect(selectTodaysGame(schedule, localDate(2026, 10, 5))).toBeNull();
  });
});

// --- getGameState ---

describe('getGameState', () => {
  it('stays live all evening, across the UTC date rollover', () => {
    // Regression: the old UTC-date comparison flipped an in-progress game to
    // FUTURE the moment UTC rolled over (8pm ET), i.e. one hour into a 7pm game.
    const game = makeGame({ gameState: 'LIVE', gameDate: '2026-09-25' });
    for (const hour of [19, 20, 21, 22, 23]) {
      expect(getGameState(game, localDate(2026, 9, 25, hour, 30))).toBe(NHLGameState.LIVE);
    }
  });

  it('keeps a game live after it crosses local midnight', () => {
    const game = makeGame({ gameState: 'LIVE', gameDate: '2026-09-25' });
    expect(getGameState(game, localDate(2026, 9, 26, 0, 30))).toBe(NHLGameState.LIVE);
  });

  it('treats CRIT as live', () => {
    const game = makeGame({ gameState: 'CRIT', gameDate: '2026-09-25' });
    expect(getGameState(game, localDate(2026, 9, 25, 22, 0))).toBe(NHLGameState.LIVE);
  });

  it.each(['FINAL', 'OFF'])('treats %s as postgame', (state) => {
    const game = makeGame({ gameState: state, gameDate: '2026-09-25' });
    expect(getGameState(game, localDate(2026, 9, 25, 23, 0))).toBe(NHLGameState.POSTGAME);
  });

  it.each(['FUT', 'PRE'])('treats %s today as pregame', (state) => {
    const game = makeGame({ gameState: state, gameDate: '2026-09-25' });
    expect(getGameState(game, localDate(2026, 9, 25, 12, 0))).toBe(NHLGameState.PREGAME);
  });

  it('treats a scheduled game on a later date as future', () => {
    const game = makeGame({ gameState: 'FUT', gameDate: '2026-09-29' });
    expect(getGameState(game, localDate(2026, 9, 25, 12, 0))).toBe(NHLGameState.FUTURE);
  });

  it('returns NONE when the state is empty', () => {
    expect(getGameState(makeGame({ gameState: '' }))).toBe(NHLGameState.NONE);
  });
});

// --- isPeriodActive ---

describe('isPeriodActive', () => {
  it('is true while the clock is running', () => {
    expect(isPeriodActive(makeGame({ gameState: 'LIVE', clock: makeClock() }))).toBe(true);
  });

  it('ignores in-period stoppages', () => {
    const clock = makeClock({ running: false, secondsRemaining: 754 });
    expect(isPeriodActive(makeGame({ gameState: 'LIVE', clock }))).toBe(true);
  });

  it('is false during a flagged intermission', () => {
    const clock = makeClock({ inIntermission: true, timeRemaining: '16:09', secondsRemaining: 969 });
    expect(isPeriodActive(makeGame({ gameState: 'LIVE', clock }))).toBe(false);
  });

  it('is false at 00:00 stopped, before inIntermission catches up', () => {
    const clock = makeClock({ timeRemaining: '00:00', secondsRemaining: 0, running: false });
    expect(isPeriodActive(makeGame({ gameState: 'LIVE', clock }))).toBe(false);
  });

  it('is true during a shootout, which has no running clock', () => {
    const clock = makeClock({ timeRemaining: '00:00', secondsRemaining: 0, running: false });
    const periodDescriptor = { number: 5, periodType: 'SO', maxRegulationPeriods: 3 };
    expect(isPeriodActive(makeGame({ gameState: 'LIVE', clock, periodDescriptor }))).toBe(true);
  });

  it('is false for a finished game sitting at 00:00', () => {
    const clock = makeClock({ timeRemaining: '00:00', secondsRemaining: 0, running: false });
    expect(isPeriodActive(makeGame({ gameState: 'FINAL', clock }))).toBe(false);
  });

  it('survives a game that has no clock yet', () => {
    // /landing omits clock and periodDescriptor entirely until the game starts.
    const game = { ...makeGame({ gameState: 'FUT' }), clock: undefined, periodDescriptor: undefined };
    expect(isPeriodActive(game)).toBe(false);
    expect(() => pollInterval(game)).not.toThrow();
  });
});

// --- pollInterval ---

describe('pollInterval', () => {
  it('stops polling once the game is final', () => {
    expect(pollInterval(makeGame({ gameState: 'FINAL' }))).toBe(false);
  });

  it('polls fast while the puck is in play', () => {
    expect(pollInterval(makeGame({ gameState: 'LIVE', clock: makeClock() }))).toBe(POLL_ACTIVE);
  });

  it('backs off during intermission', () => {
    const clock = makeClock({ inIntermission: true });
    expect(pollInterval(makeGame({ gameState: 'LIVE', clock }))).toBe(POLL_INTERMISSION);
  });

  it('idles when puck drop is hours away', () => {
    const game = makeGame({ gameState: 'FUT', startTimeUTC: '2026-09-26T23:00:00Z' });
    expect(pollInterval(game, new Date('2026-09-26T12:00:00Z'))).toBe(POLL_IDLE);
  });

  it('tightens up near puck drop', () => {
    const game = makeGame({ gameState: 'FUT', startTimeUTC: '2026-09-26T23:00:00Z' });
    expect(pollInterval(game, new Date('2026-09-26T22:30:00Z'))).toBe(POLL_PREGAME);
  });

  it('polls at the pregame cadence when there is no game yet', () => {
    expect(pollInterval(undefined)).toBe(POLL_PREGAME);
  });
});

// --- deriveLocation ---

function game(home: string, away: string, extra: Partial<NHLScheduleGame> = {}): NHLScheduleGame {
  return {
    id: 2026020001,
    gameType: 2,
    gameDate: '2026-09-29',
    startTimeUTC: '2026-09-29T21:00:00Z',
    venueUTCOffset: '-04:00',
    venueTimezone: 'US/Eastern',
    gameState: 'FUT',
    gameScheduleState: 'OK',
    homeTeam: { abbrev: home } as NHLScheduleTeam,
    awayTeam: { abbrev: away } as NHLScheduleTeam,
    ...extra,
  };
}

describe('deriveLocation', () => {
  it('reads a home game from the home side', () => {
    expect(deriveLocation(game('CAR', 'FLA'))).toBe('home');
  });

  it('reads a road game from the away side', () => {
    expect(deriveLocation(game('PHI', 'CAR'))).toBe('away');
  });

  // The whole point of the feature: `location` defaults to `home` in the
  // database, so without this a road game starts on the wrong pool.
  it('does not return home for a game CAR is not hosting', () => {
    expect(deriveLocation(game('PHI', 'CAR'))).not.toBe('home');
  });

  it('declines to answer with no game', () => {
    expect(deriveLocation(null)).toBeNull();
    expect(deriveLocation(undefined)).toBeNull();
  });

  // A Stadium Series game is not really either one; the player is better
  // placed to say which squares they want.
  it('declines to answer at a neutral site', () => {
    expect(deriveLocation(game('CAR', 'FLA', { neutralSite: true }))).toBeNull();
    expect(deriveLocation(game('FLA', 'CAR', { neutralSite: true }))).toBeNull();
  });

  // Both sides are checked, so a payload missing the abbrevs reads as "no
  // answer" rather than silently falling through to away.
  it('declines to answer when CAR is on neither side', () => {
    expect(deriveLocation(game('BOS', 'FLA'))).toBeNull();
  });

  it('declines to answer when the abbrevs are missing', () => {
    const broken = game('CAR', 'FLA');
    // @ts-expect-error — deliberately modelling a malformed payload
    broken.homeTeam = undefined;
    // @ts-expect-error — deliberately modelling a malformed payload
    broken.awayTeam = undefined;
    expect(deriveLocation(broken)).toBeNull();
  });
});
