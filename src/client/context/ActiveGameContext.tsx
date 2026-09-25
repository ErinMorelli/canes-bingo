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

  const value = useMemo<ActiveGameContextValue>(
    () => ({
      activeGame,
      refreshGame: refetch,
      gameState: getGameState(activeGame),
      isPeriodActive: isPeriodActive(activeGame),
    }),
    [activeGame, refetch]
  );

  return (
    <ActiveGameContext.Provider value={value}>
      {children}
    </ActiveGameContext.Provider>
  )
}
