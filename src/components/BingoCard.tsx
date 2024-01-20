import { forwardRef } from 'react';

import { BoardSquare } from '../types';
import { useGameBoard } from '../hooks';
import { FREE_SPACE } from '../constants.ts';

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
        const squareValue = squareId === '2:2' ? FREE_SPACE : value.value;
        return (
          <div className={`square${selected ? ' selected' : ''}`}
               id={`square-${rowId}-${colId}`}
               key={`square-${rowId}-${colId}`}
               onClick={() => handleClick(rowId, colId)}
               onKeyUp={(event) => {
                 if (event.code.toLowerCase() === 'enter') {
                   event.preventDefault();
                   handleClick(rowId, colId);
                 }
               }}
               aria-label={`${selected ? 'SELECTED ' : ''} ${squareValue}`}
               tabIndex={0}
          >{squareValue}</div>
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
