import { forwardRef } from 'react';

import { useGameBoard } from '@hooks';
import { BoardSquare } from '@app/types';

import { CardSquare } from './CardSquare.tsx';

export const Card = forwardRef<HTMLDivElement>(
  (_, ref) => {
    const { board, selectSquare } = useGameBoard();

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
          onClick={handleClick}
        />
      ))
    };

    return (
      <div className="bingo" ref={ref}>
        {board.map((row, rowId) => (
          <div className="row"
               id={`row-${rowId}`}
               key={`${row.length}-${rowId}`}
          >{generateRow(row, rowId)}</div>
        ))}
      </div>
    );
  }
);
