import { forwardRef, useEffect, useState } from 'react';
import { Typography } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';

import confetti from 'canvas-confetti';

import { useConfig, useGameBoard, useGames } from '@hooks';
import { BoardSquare } from '@app/types';

import { CardSquare } from './CardSquare.tsx';

const { Text } = Typography;

type CardProps = {
  notify: NotificationInstance;
  customClass?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, notify }: CardProps, ref) => {
    const { board, selectSquare, validateGameBoard } = useGameBoard();
    const { isEnabled, selectedGame } = useGames();
    const { theme } = useConfig();

    const [hasWon, setHasWon] = useState<boolean>(false);

    useEffect(() => setHasWon(false), [isEnabled, selectedGame]);

    useEffect(() => {
      if (!isEnabled || hasWon) return;
      if (validateGameBoard()) {
        const timeout = setTimeout(() => {
          setHasWon(true);
          notify.open({
            className: 'bingo-win-notice',
            title: <Text>BINGO!</Text>,
            closeIcon: false,
            pauseOnHover: false,
            duration: 3,
          });
          confetti({
            particleCount: 200,
            spread: 200,
            colors: [
              theme.config.token?.colorPrimary || '',
              theme.config.token?.colorLink || '',
              theme.config.components?.Layout?.headerColor || '',
              theme.config.components?.Layout?.footerBg || '',
            ].filter(Boolean),
            origin: { y: 0.4 },
            shapes: ['star', 'circle', 'square'],
          });
        }, 500);
        return () => clearTimeout(timeout);
      }
    }, [board, hasWon, isEnabled, validateGameBoard]);

    function handleClick(rowId: number, coldId: number) {
      selectSquare(rowId, coldId);
    }

    const generateRow = (row: BoardSquare[], rowId: number) => {
      return row.map((square, colId) => (
        <CardSquare
          key={`${rowId}-${colId}`}
          square={square}
          rowId={rowId}
          colId={colId}
          customClass={customClass}
          onClick={handleClick}
        />
      ))
    };

    return (
      <div className="bingo" ref={ref}>
        {board.map((row, rowId) => (
          <div
            className="row"
            id={`row-${rowId}`}
            key={`${row.length}-${rowId}`}
          >{generateRow(row, rowId)}</div>
        ))}
      </div>
    );
  }
);
