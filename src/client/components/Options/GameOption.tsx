import { useCallback, useMemo } from 'react';
import { Flex, Switch } from 'antd';

import { Game } from '@app/types';

import { useConfig, useGames } from '@hooks';

import { PatternGame } from '@components/Pattern';

export default function GameOption() {
  const { theme } = useConfig();
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
      const classes = ['game-option', theme.name];
      if (selectedGame?.id === game.id) classes.push('selected');
      return (
        <button
          className={classes.join(' ')}
          onClick={() => handleChange(game)}>
          <PatternGame game={game} size={7} />
          <div className="game-option-name">{game.name}</div>
        </button>
      );
    });
  }, [games, handleChange, selectedGame?.id, theme.name]);

  return gamesLoaded ? (
    <Flex orientation="vertical" gap={8}>
      <Flex align="center" justify="space-between">
        <Flex orientation="vertical">
          <div className="group-title">Game Pattern</div>
          {/*
            Says there is no pattern while the switch is off, matching the
            status strip word for word.
            The design leaves the selected game's name here either way, but
            that put the drawer and the status strip in contradiction — the
            panel read "Any Five" while the strip read "No pattern" — and the
            pattern it named was not being played.
          */}
          <div className="game-title">
            {isEnabled ? selectedGame?.name : 'No pattern'}
          </div>
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