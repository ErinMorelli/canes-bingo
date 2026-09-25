import { useActiveGame } from '@hooks/useActiveGame';
import { NHLGameState } from '@app/types';
import { Flex } from 'antd';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { format } from 'date-fns';

export function StatusGame() {
  const { activeGame, gameState } = useActiveGame();

  const home = useMemo(() => activeGame.homeTeam?.abbrev, [activeGame.homeTeam]);
  const away = useMemo(() => activeGame.awayTeam?.abbrev, [activeGame.awayTeam]);

  const score = useMemo<React.ReactNode>(() => {
    if ([NHLGameState.FUTURE, NHLGameState.PREGAME].includes(gameState)) {
      return 'VS';
    }
    const homeScore = activeGame.homeTeam?.score || 0;
    const awayScore = activeGame.awayTeam?.score || 0;
    return `${homeScore} - ${awayScore}`;
  }, [activeGame, gameState]);

  const time = useMemo(() => {
    const gameDate = new Date(activeGame.startTimeUTC);

    if (gameState === NHLGameState.PREGAME) {
      const puckDrop = format(gameDate, 'p');
      return `Puck drop ${puckDrop}`;
    }

    if (gameState === NHLGameState.FUTURE) {
      return format(gameDate, 'E p');
    }

    if (gameState === NHLGameState.LIVE) {
      const remaining = activeGame.clock?.timeRemaining || '00:00';
      let period = '';
      if (activeGame.displayPeriod === 1) period = '1st';
      if (activeGame.displayPeriod === 2) period = '2nd';
      if (activeGame.displayPeriod === 3) period = '3rd';
      return `${period} · ${remaining}`;
    }

    return 'Final';
  }, [activeGame.clock, activeGame.displayPeriod, activeGame.startTimeUTC, gameState]);

  const backgroundColor = useMemo(() => {
    if (gameState === NHLGameState.LIVE) return 'red';
    return 'transparent';
  }, [gameState]);

  const link = useMemo(() => {
    if (gameState === NHLGameState.FUTURE) {
      return 'https://www.nhl.com/hurricanes/schedule';
    }
    return `https://www.nhl.com/gamecenter/${activeGame.id}`;
  }, [activeGame, gameState]);

  return (
    <Flex className="game-status" orientation="vertical">
      <Flex className="header">
        {gameState === NHLGameState.FUTURE && (
          <div className="next">Next</div>
        )}
        <Flex gap={6} className="teams">
          <div className="home">{home}</div>
          <div className="score">{score}</div>
          <div className="away">{away}</div>
        </Flex>
      </Flex>
      <Flex className="details" align="center">
        <div className="live-dot" style={{ backgroundColor}}></div>
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
