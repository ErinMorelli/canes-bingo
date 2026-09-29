import { useQuery } from '@tanstack/react-query';

import { NHLScheduleGame } from '@app/types';
import { POLL_SCHEDULE, fetchSchedule, selectTodaysGame } from '@app/nhl';

/** Shared by every caller, so the schedule is fetched once. */
export const SCHEDULE_QUERY_KEY = ['nhl', 'schedule', 'CAR'] as const;

export type NextGame = {
  /** Tonight's game, the next one scheduled, or null if neither is known. */
  game: NHLScheduleGame | null;
  /**
   * The schedule has come back, one way or the other.
   *
   * Callers deriving a setting from the schedule need to know the difference
   * between "no game yet" and "asked, and there is no answer" — the first is
   * worth waiting a moment for, the second is not. The client retries once,
   * so on an outage this still settles in about a second rather than hanging.
   */
  settled: boolean;
};

/**
 * Tonight's game, or the next one on the schedule.
 *
 * Extracted from `ActiveGameProvider` because the game board needs it too,
 * and the provider is mounted inside `Status` — far below `GameBoardProvider`
 * in the tree, so its context is out of reach. Rather than hoist the provider
 * and re-order everything above it, both callers use this hook: react-query
 * keys the result, so the second caller reads the first one's cache and no
 * extra request goes out.
 *
 * Returns `null` rather than a fallback while loading or after a failure.
 * `ActiveGameProvider` substitutes `FALLBACK_GAME` so the status strip always
 * has something to render, but that fallback asserts CAR at home — anything
 * *deriving* a setting has to see the absence instead, or an outage silently
 * becomes a confident wrong answer.
 */
export function useNextGame(): NextGame {
  const { data = null, isPending } = useQuery({
    queryKey: SCHEDULE_QUERY_KEY,
    queryFn: fetchSchedule,
    select: (schedule) => selectTodaysGame(schedule),
    staleTime: POLL_SCHEDULE,
    refetchInterval: POLL_SCHEDULE,
  });

  return { game: data, settled: !isPending };
}
