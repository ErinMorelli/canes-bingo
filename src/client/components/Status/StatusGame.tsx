import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flex, theme } from 'antd';
import { format } from 'date-fns';

import { NHLGameState } from '@app/types';

import { useActiveGame } from '@hooks/useActiveGame';

const { useToken } = theme;

export function StatusGame() {
  const { activeGame, gameState, isPeriodActive } = useActiveGame();
  const { token } = useToken();

  const home = useMemo(() => activeGame.homeTeam?.abbrev, [activeGame.homeTeam]);
  const away = useMemo(() => activeGame.awayTeam?.abbrev, [activeGame.awayTeam]);

  const score = useMemo<React.ReactNode>(() => {
    if ([NHLGameState.FUTURE, NHLGameState.PREGAME].includes(gameState)) {
      return 'VS';
    }
    const homeScore = activeGame.homeTeam?.score || 0;
    const awayScore = activeGame.awayTeam?.score || 0;
    return `${awayScore} - ${homeScore}`;
  }, [activeGame, gameState]);

  const time = useMemo(() => {
    const gameDate = new Date(activeGame.startTimeUTC);

    if (gameState === NHLGameState.PREGAME) {
      const puckDrop = format(gameDate, 'p');
      return `Puck drop ${puckDrop}`;
    }

    if (gameState === NHLGameState.FUTURE) {
      return format(gameDate, 'E · p');
    }

    if (gameState === NHLGameState.LIVE) {
      const remaining = activeGame.clock?.timeRemaining || '00:00';
      const periodNumber = activeGame.periodDescriptor?.number;
      let period = '';
      if (periodNumber === 1) period = '1st';
      if (periodNumber === 2) period = isPeriodActive ? '2nd' : '1st intermission';
      if (periodNumber === 3) period = isPeriodActive ? '3rd' : '2nd intermission';
      if (periodNumber === 4) period = isPeriodActive ? 'OT' : '3rd intermission';
      if (periodNumber === 5) period = 'SO';
      return `${period} · ${remaining}`;
    }

    return 'Final';
  }, [activeGame.clock?.timeRemaining, activeGame.periodDescriptor?.number, activeGame.startTimeUTC, gameState, isPeriodActive]);

  const backgroundColor = useMemo(() => {
    if (gameState === NHLGameState.LIVE) {
      if (isPeriodActive) return token.colorPrimary;
      return token.colorTextSecondary;
    }
    return 'transparent';
  }, [gameState, isPeriodActive, token.colorPrimary, token.colorTextSecondary]);

  const link = useMemo(() => {
    if (gameState === NHLGameState.FUTURE) {
      return 'https://www.nhl.com/hurricanes/schedule';
    }
    return `https://www.nhl.com/gamecenter/${activeGame.id}`;
  }, [activeGame, gameState]);

  const dotClasses = useMemo(() => {
    const classes = ['live-dot'];
    if (gameState === NHLGameState.LIVE && isPeriodActive) {
      classes.push('live');
    }
    return classes.join(' ');
  }, [gameState, isPeriodActive]);

  return (
    <Flex className="game-status" orientation="vertical">
      <Flex className="header">
        {gameState === NHLGameState.FUTURE && (
          <div className="next">Next</div>
        )}
        <Flex gap={6} className="teams">
          <div className="away">{away}</div>
          <div className="score">{score}</div>
          <div className="home">{home}</div>
        </Flex>
      </Flex>
      <Flex className="details" align="center">
        <div
          className={dotClasses}
          style={{ backgroundColor}}></div>
        <Flex gap={6}>
          <div className="time">{time}</div>
          <span>·</span>
          <Link to={link} target="_blank" rel="noreferrer">
            {gameState === NHLGameState.FUTURE ? 'Schedule' : 'Gamecenter'} ↗
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
}
