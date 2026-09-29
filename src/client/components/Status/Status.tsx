import { Flex } from 'antd';

import { headerRule } from '@app/themes';

import { ActiveGameProvider } from '@context/ActiveGameContext';

import { StatusGame } from './StatusGame';
import { useGameBoard, useGames } from '@hooks';
import { PatternAnimated } from '@components/Pattern';
import { useMemo } from 'react';

type StatusProps = {
  themeName: string;
}

export function Status({ themeName }: Readonly<StatusProps>) {
  const { selectedGame, isEnabled } = useGames();
  const { squaresRemaining, hasWon, winningPattern } = useGameBoard();

  const borderColor = headerRule[themeName];

  const remainingText = useMemo(() => {
    return String(squaresRemaining).padStart(2, '0');
  }, [squaresRemaining]);

  /**
   * On a win the strip shows the completed pattern rather than cycling the
   * game's list, so the mini-grid and the bar are describing the same thing.
   */
  const shownPatterns = useMemo(
    () => (hasWon && winningPattern ? [winningPattern] : selectedGame?.patterns ?? []),
    [hasWon, winningPattern, selectedGame]
  );

  return (
    <div className={`status-bar${hasWon ? ' won' : ''}`} style={{
      borderTopColor: borderColor,
      borderTopWidth: "2px",
      borderTopStyle: "solid",
    }}>
      <Flex justify="space-between" align="center">
        <ActiveGameProvider>
          <StatusGame />
        </ActiveGameProvider>
        {/*
          With patterns switched off there is no win condition, so a count
          would be describing a race nobody is running — the strip said
          "04 To Go" for a game that could not be won. The design replaces the
          whole group, mini-grid included: with no pattern there is nothing to
          draw one of.
        */}
        {!isEnabled ? (
          <Flex
            className="pattern-status"
            orientation="vertical"
            align="flex-end"
            gap={2}>
            <div className="remaining free-play">FREE PLAY</div>
            <div className="pattern-name">No pattern</div>
          </Flex>
        ) : selectedGame && (
          <Flex
            className="pattern-status"
            orientation="vertical"
            align="flex-end"
            gap={2}>
              <Flex align="center" gap={7}>
                <PatternAnimated patterns={shownPatterns} size={8} />
                {/* "BINGO" replaces the count outright — there is nothing left
                    to go, so the label goes with it. */}
                {hasWon ? (
                  <div className="remaining won">BINGO</div>
                ) : (
                  <>
                    <div className="remaining">{remainingText}</div>
                    <div className="togo">To Go</div>
                  </>
                )}
              </Flex>
              <div className="pattern-name">{selectedGame.name}</div>
          </Flex>
        )}
      </Flex>
    </div>
  );
}
