import { ActiveGameContext, ActiveGameContextValue } from '@context/contexts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  NHLActiveGame,
  NHLGameState,
  NHLScheduleResult,
  NHLScheduleTeam
} from '@app/types.ts';

const API_ROOT = 'https://api-web.nhle.com/v1';
const SCHEDULE_URL = `${API_ROOT}/club-schedule/CAR/week/now`;
const GAME_URL = `${API_ROOT}/gamecenter/GAME_ID/play-by-play`;

const FALLBACK_GAME: NHLActiveGame = {
  id: -1,
  gameState: '',
  gameDate: '',
  gameScheduleState: '',
  startTimeUTC: '2026-09-20T23:00:00Z',
  shootoutInUse: true,
  otInUse: true,
  displayPeriod: 1,
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
};

async function fetchSchedule(): Promise<NHLScheduleResult | null> {
  try {
    const response = await fetch(SCHEDULE_URL);
    return await response.json() as NHLScheduleResult;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchGame(gameId: number): Promise<NHLActiveGame | null> {
  try {
    const url = GAME_URL.replace('GAME_ID', gameId.toString());
    const response = await fetch(url);
    return await response.json() as NHLActiveGame;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getTodaysGame(): Promise<NHLActiveGame> {
  let game;

  const schedule = await fetchSchedule();
  if (!schedule) return FALLBACK_GAME;

  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];

  // Look for today's game first
  game = schedule.games.find((game) => {
    const startTime = new Date(game.startTimeUTC);
    const startTimeDate = startTime.toISOString().split('T')[0];
    return todayDate === startTimeDate;
  });

  // Fall back to next game
  if (!game) {
    game = schedule.games.find((game) => {
      const startTime = new Date(game.startTimeUTC);
      return startTime > today;
    });
  }

  if (!game) return FALLBACK_GAME;

  return await fetchGame(game.id) || FALLBACK_GAME;
}

function getGameState(game: NHLActiveGame): NHLGameState {
  const state = game.gameState.toUpperCase();
  if (!state) return NHLGameState.NONE;

  const today = new Date().toISOString().split('T')[0];
  const gameDate = new Date(game.startTimeUTC).toISOString().split('T')[0];

  if (gameDate !== today) return NHLGameState.FUTURE;
  if (state === 'FUT') return NHLGameState.PREGAME;
  if (state === 'LIVE') return NHLGameState.LIVE;
  if (state === 'FINAL') return NHLGameState.POSTGAME;

  return NHLGameState.NONE
}

export function ActiveGameProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeGame, setActiveGame] = useState<NHLActiveGame>(FALLBACK_GAME);

  useEffect(() => {
    if (!activeGame) {
      getTodaysGame().then((game) => {
        setActiveGame(game);
      });
    }
  }, [activeGame, setActiveGame]);

  const refreshGame = useCallback(() => {
    if (activeGame) {
      fetchGame(activeGame.id).then((game) => {
        if (!game) return;
        setActiveGame(game);
      });
    }
  }, [activeGame, setActiveGame]);

  const value = useMemo<ActiveGameContextValue>(
    () => ({
      activeGame,
      refreshGame,
      gameState: NHLGameState.FUTURE, //getGameState(activeGame),
    }),
    [activeGame, refreshGame]
  );

  return (
    <ActiveGameContext.Provider value={value}>
      {children}
    </ActiveGameContext.Provider>
  )
}