import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Game, Games } from '@app/types';
import { LOCAL_STORAGE_PREFIX } from '@app/constants';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

import { useLocalStorage } from './useLocalStorage';

const SELECTED_GAME_KEY = `${LOCAL_STORAGE_PREFIX}:selectedGame`;
const ENABLED_KEY = `${LOCAL_STORAGE_PREFIX}:gamesEnabled`;

export function useGames() {
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const result = await apiClient.provide(Api.games.list, {});
      return getData(result).items as Games;
    },
  });

  const [selectedGameId, setSelectedGameId] = useLocalStorage<number | null>(
    SELECTED_GAME_KEY,
    null
  );
  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(ENABLED_KEY, true);

  // Initialize to default game if nothing is persisted
  useEffect(() => {
    if (!isLoading && games.length && selectedGameId === null) {
      const defaultGame = games.find((g) => g.isDefault);
      if (defaultGame) setSelectedGameId(defaultGame.id);
    }
  }, [isLoading, games, selectedGameId, setSelectedGameId]);

  const selectedGame = useMemo<Game | undefined>(
    () =>
      games.find((g) => g.id === selectedGameId) ??
      games.find((g) => g.isDefault),
    [games, selectedGameId]
  );

  return {
    games,
    selectedGame,
    gamesLoaded: !isLoading,
    isEnabled,
    setIsEnabled,
    setSelectedGame: (game: Game) => setSelectedGameId(game.id),
  };
}
