import { useCallback, useMemo } from 'react';
import { Flex, Segmented, Switch } from 'antd';

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
    return games.map(game => ({
      value: game,
      label: (
        <Flex orientation="vertical" align="center">
          <PatternGame game={game} size={7} />
          <div className="game-pattern-select-name">{game.name}</div>
        </Flex>
      ),
    }))
  }, [games]);

  return gamesLoaded ? (
    <Flex orientation="vertical" gap={8}>
      <Flex align="center" justify="space-between">
        <Flex orientation="vertical">
          <div className="group-title">Game Pattern</div>
          <div>{selectedGame?.name}</div>
        </Flex>
        <Switch
          value={isEnabled}
          onChange={(e) => setIsEnabled(e)}
        />
      </Flex>
      {isEnabled && selectedGame && (
        <>
          <Flex>
            <Segmented<Game>
              block
              options={options}
              value={selectedGame}
              onChange={handleChange}
            />
          </Flex>
          <Flex></Flex>
        </>
      )}
    </Flex>
  ) : null;
}