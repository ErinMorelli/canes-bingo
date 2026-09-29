import { format } from 'date-fns';

import {
  NHLActiveGame,
  NHLGameState,
  NHLScheduleGame,
  NHLScheduleResult,
  NHLScheduleTeam
} from './types';

// Proxied through our own server: api-web.nhle.com sends no CORS headers, so
// the browser cannot reach it directly. See src/server/nhl-proxy.ts.
const API_ROOT = '/api/nhl';
const SCHEDULE_URL = `${API_ROOT}/schedule`;
const GAME_URL = `${API_ROOT}/game`;

export const POLL_ACTIVE = 15_000;        // puck in play
export const POLL_INTERMISSION = 60_000;  // between periods
export const POLL_PREGAME = 60_000;       // near puck drop
export const POLL_IDLE = 15 * 60_000;     // hours out
export const POLL_SCHEDULE = 15 * 60_000; // which game we should be watching

const DATE_KEY = 'yyyy-MM-dd';

export const FALLBACK_GAME: NHLActiveGame = {
  id: -1,
  gameType: 0,
  venueTimezone: '',
  venueUTCOffset: '',
  gameState: '',
  gameDate: '',
  gameScheduleState: '',
  startTimeUTC: '2026-09-20T23:00:00Z',
  shootoutInUse: true,
  otInUse: true,
  tiesInUse: false,
  regPeriods: 3,
  maxPeriods: 5,
  clock: {
    timeRemaining: '',
    secondsRemaining: 0,
    running: false,
    inIntermission: false,
  },
  awayTeam: { abbrev: 'FLA' } as NHLScheduleTeam,
  homeTeam: { abbrev: 'CAR' } as NHLScheduleTeam,
  periodDescriptor: {
    number: 1,
    periodType: 'REG',
    maxRegulationPeriods: 3,
  }
};

// These throw instead of returning null so react-query can see the failure and
// drive its own retry and error state.
export async function fetchSchedule(): Promise<NHLScheduleResult> {
  const response = await fetch(SCHEDULE_URL);
  if (!response.ok) {
    throw new Error(`NHL schedule request failed: ${response.status}`);
  }
  return await response.json() as NHLScheduleResult;
}

export async function fetchGame(gameId: number): Promise<NHLActiveGame> {
  const url = `${GAME_URL}/${gameId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NHL game request failed: ${response.status}`);
  }
  return await response.json() as NHLActiveGame;
}

/**
 * Is this game on tonight?
 *
 * Uses the API's `gameDate` (the venue-local date the game belongs to) rather
 * than deriving a date from `startTimeUTC`. A 10pm ET puck drop is 02:00Z the
 * *next* day, so comparing UTC calendar dates reads late games as tomorrow's.
 */
export function isGameToday(game: NHLScheduleGame, now = new Date()): boolean {
  return !!game.gameDate && game.gameDate === format(now, DATE_KEY);
}

/** Today's game if there is one, otherwise the next one on the schedule. */
export function selectTodaysGame(
  schedule: NHLScheduleResult,
  now = new Date()
): NHLScheduleGame | null {
  const todaysGame = schedule.games.find((game) => isGameToday(game, now));
  if (todaysGame) return todaysGame;

  // Fall back to next game
  return schedule.games.find((game) => new Date(game.startTimeUTC) > now) ?? null;
}

export function getGameState(game: NHLActiveGame, now = new Date()): NHLGameState {
  const state = game.gameState.toUpperCase();
  if (!state) return NHLGameState.NONE;

  // The API's own state wins for anything in progress or finished: a game that
  // runs past local midnight is still live, whatever the calendar says.
  if (state === 'LIVE' || state === 'CRIT') return NHLGameState.LIVE;
  if (state === 'FINAL' || state === 'OFF') return NHLGameState.POSTGAME;

  // FUT / PRE — tonight's game is pregame, anything further out is upcoming.
  return isGameToday(game, now) ? NHLGameState.PREGAME : NHLGameState.FUTURE;
}

export function isPeriodActive(game: NHLActiveGame): boolean {
  const state = game.gameState.toUpperCase();

  // Only LIVE/CRIT can be mid-period; FINAL/OFF also sit at 00:00 stopped.
  if (state !== 'LIVE' && state !== 'CRIT') return false;

  // Absent until the puck drops.
  const { clock } = game;
  if (!clock) return false;

  if (clock.inIntermission) return false;

  // Shootout is live action with no running clock.
  if (game.periodDescriptor?.periodType === 'SO') return true;

  // Period ended but inIntermission hasn't flipped yet.
  return !(clock.secondsRemaining === 0 && !clock.running);
}

export function pollInterval(
  game: NHLActiveGame | undefined,
  now = new Date()
): number | false {
  if (!game) return POLL_PREGAME;
  const state = game.gameState.toUpperCase();

  // Terminal — nothing else changes today.
  if (state === 'FINAL' || state === 'OFF') return false;

  if (state === 'LIVE' || state === 'CRIT') {
    return isPeriodActive(game) ? POLL_ACTIVE : POLL_INTERMISSION;
  }

  // Postponed or suspended: the scheduled start is now meaningless, and
  // falling through to the maths below reads a start time in the past as
  // "about to drop" and polls every minute indefinitely.
  if (state === 'PPD' || state === 'SUSP') return POLL_IDLE;

  // PRE / FUT — tighten up as puck drop approaches.
  const msToStart = new Date(game.startTimeUTC).getTime() - now.getTime();
  return msToStart > 60 * 60_000 ? POLL_IDLE : POLL_PREGAME;
}
