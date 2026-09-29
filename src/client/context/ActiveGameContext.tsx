import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  FALLBACK_GAME,
  POLL_SCHEDULE,
  fetchGame,
  fetchSchedule,
  getGameState,
  isPeriodActive,
  pollInterval,
  selectTodaysGame
} from '@app/nhl';

import { ActiveGameContext, ActiveGameContextValue } from './contexts';

export function ActiveGameProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Which game are we watching? Changes at most once a day.
  const { data: scheduledGame } = useQuery({
    queryKey: ['nhl', 'schedule', 'CAR'],
    queryFn: fetchSchedule,
    select: (schedule) => selectTodaysGame(schedule),
    staleTime: POLL_SCHEDULE,
    refetchInterval: POLL_SCHEDULE,
  });

  const gameId = scheduledGame?.id;

  // What is happening in that game right now? Changes every shift.
  const { data: activeGame = FALLBACK_GAME, refetch } = useQuery({
    queryKey: ['nhl', 'game', gameId],
    queryFn: () => fetchGame(gameId!),
    enabled: gameId != null,
    staleTime: 0,
    refetchInterval: (query) => pollInterval(query.state.data),
  });

  /*
    Computed on every render rather than inside the memo.

    `getGameState` compares the game's date against *now*, so its answer can
    change while `activeGame` does not — and react-query's structural sharing
    means a refetch returning identical data keeps the very same object
    reference. Keyed on that reference alone, a game stayed FUTURE after
    midnight had made it PREGAME.

    Both are pure and cheap, and both return primitives, so the memo below is
    still stable whenever the answers are.
  */
  const gameState = getGameState(activeGame);
  const periodActive = isPeriodActive(activeGame);

  const value = useMemo<ActiveGameContextValue>(
    () => ({
      activeGame,
      refreshGame: refetch,
      gameState,
      isPeriodActive: periodActive,
    }),
    [activeGame, refetch, gameState, periodActive]
  );

  return (
    <ActiveGameContext.Provider value={value}>
      {children}
    </ActiveGameContext.Provider>
  )
}
