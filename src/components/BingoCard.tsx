import { BoardSquare } from '../types.ts';
import { useGameBoard } from '../hooks';

export default function BingoCard() {
  const { board, selectSquare } = useGameBoard();

  function handleClick(rowId: number, coldId: number) {
    selectSquare(rowId, coldId);
  }

  const generateRow = (row: BoardSquare[], rowId: number) => {
    return row.map((square, colId) => {
      const { selected, value } = square;
      const squareId = `${rowId}:${colId}`;
      return (
        <div className={`square ${selected && 'selected'}`}
             id={`square-${squareId}`}
             key={`square-${squareId}`}
             onClick={() => handleClick(rowId, colId)}
        >{squareId === '2:2' ? 'Free Space' : value.value}</div>
      )
    });
  };

  return (
    <div className="bingo">
      {board.map((row, rowId) => (
        <div className="row"
             id={`row-${rowId}`}
             key={`row-${rowId}`}
        >{generateRow(row, rowId)}</div>
      ))}
    </div>
  );
}
