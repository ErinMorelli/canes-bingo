import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { Game, Games } from '@app/types.ts';
import { useAppDispatch } from '@app/store.ts';
import {
  fetchGames,
  selectEnabled,
  selectGame,
  selectGames,
  selectGamesLoaded,
  selectSelectedGame,
  toggleEnabled
} from '@slices';

type UseGamesResult = {
  games: Games;
  selectedGame?: Game;
  loadGames: () => void;
  setSelectedGame: (game: Game) => void;
  gamesLoaded: boolean;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export function useGames(): UseGamesResult {
  const dispatch = useAppDispatch();

  const games = useSelector(selectGames);
  const gamesLoaded = useSelector(selectGamesLoaded);
  const selectedGame = useSelector(selectSelectedGame);
  const isEnabled = useSelector(selectEnabled) ?? false;

  const loadGames = useCallback(
    () => {
      if (!gamesLoaded) dispatch(fetchGames());
    },
    [dispatch, gamesLoaded]
  );

  const setSelectedGame = useCallback((game: Game) => {
    dispatch(selectGame(game));
  }, [dispatch]);

  const setIsEnabled = useCallback((enabled: boolean) => {
    dispatch(toggleEnabled(enabled));
  }, [dispatch]);

  return {
    games,
    selectedGame,
    setSelectedGame,
    loadGames,
    gamesLoaded,
    isEnabled,
    setIsEnabled,
  };
}
