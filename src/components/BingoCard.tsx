import { forwardRef } from 'react';

import { BoardSquare } from '../types';
import { useGameBoard } from '../hooks';

const BingoCard = forwardRef<HTMLDivElement>(
  (_, ref) => {
    const { board, selectSquare } = useGameBoard();

    function handleClick(rowId: number, coldId: number) {
      selectSquare(rowId, coldId);
    }

    const generateRow = (row: BoardSquare[], rowId: number) => {
      return row.map((square, colId) => {
        const { selected, value } = square;
        const squareId = `${rowId}:${colId}`;
        return (
          <div className={`square${selected ? ' selected' : ''}`}
               id={`square-${squareId}`}
               key={`square-${squareId}`}
               onClick={() => handleClick(rowId, colId)}
          >{squareId === '2:2' ? 'Free Space' : value.value}</div>
        )
      });
    };

    return (
      <div className="bingo" ref={ref}>
        {board.map((row, rowId) => (
          <div className="row"
               id={`row-${rowId}`}
               key={`row-${rowId}`}
          >{generateRow(row, rowId)}</div>
        ))}
      </div>
    );
  }
);

export default BingoCard;
