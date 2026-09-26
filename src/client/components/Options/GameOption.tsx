import { useCallback, useMemo } from 'react';
import { Flex, Switch } from 'antd';

import { Game } from '@app/types';

import { useGames } from '@hooks';

import { PatternGame } from '@components/Pattern';

export default function GameOption() {
  const {
    games,
    gamesLoaded,
    selectedGame,
    isEnabled,
    setSelectedGame,
    setIsEnabled,
  } = useGames();

  const handleChange = useCallback((value: Game) => {
    setSelectedGame(value);
  }, [setSelectedGame]);

  const options = useMemo(() => {
    return games.map(game => {
      const isSelected = selectedGame?.id === game.id;
      return (
        <button
          className={'game-option' + (isSelected ? ' selected' : '')}
          onClick={() => handleChange(game)}>
          <PatternGame game={game} size={7} />
          <div className="game-option-name">{game.name}</div>
        </button>
      );
    });
  }, [games, handleChange, selectedGame?.id]);

  return gamesLoaded ? (
    <Flex orientation="vertical" gap={8}>
      <Flex align="center" justify="space-between">
        <Flex orientation="vertical">
          <div className="group-title">Game Pattern</div>
          <div className="game-title">{selectedGame?.name}</div>
        </Flex>
        <Switch
          value={isEnabled}
          onChange={(e) => setIsEnabled(e)}
        />
      </Flex>
      {isEnabled && selectedGame && (
        <>
          <Flex gap={4}>{options}</Flex>
          <Flex className="game-option-description">
            {selectedGame.description}
          </Flex>
        </>
      )}
    </Flex>
  ) : null;
}