import { useCallback, useEffect, useState } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { Skeleton } from 'antd';

import { BoardSquare } from '@app/types';
import { fetchConfigValue } from '@app/utils';

type SquareProps = {
  square: BoardSquare;
  rowId: number;
  colId: number;
  onClick: (rowId: number, colId: number) => void;
};

function getSquareId(rowId: number, colId: number) {
  return `square-${rowId}-${colId}`;
}

export function CardSquare({ square, rowId, colId, onClick }: SquareProps) {
  const { selected, value } = square;

  const squareId = getSquareId(rowId, colId);

  const [squareValue, setSquareValue] = useState<ReactNode>(
    <Skeleton.Avatar active={true} size="small" shape="square" />
  );

  useEffect(() => {
    if (rowId === 2 && colId === 2) {
      fetchConfigValue('freeSpace').then(setSquareValue);
    } else {
      setSquareValue(value.value);
    }
  }, [colId, rowId, value.value]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.code.toLowerCase();

    if (['enter', 'space'].includes(key)) {
      event.preventDefault();
      onClick(rowId, colId);
    }
    else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      let newRowId = rowId, newColId = colId;
      switch (key) {
        case 'arrowup':    newRowId = rowId === 0 ? 4 : rowId - 1; break;
        case 'arrowdown':  newRowId = rowId === 4 ? 0 : rowId + 1; break;
        case 'arrowleft':  newColId = colId === 0 ? 4 : colId - 1; break;
        case 'arrowright': newColId = colId === 4 ? 0 : colId + 1; break;
        default: break;
      }
      const nextSquareId = getSquareId(newRowId, newColId);
      document.getElementById(nextSquareId)?.focus();
    }
  }, [colId, onClick, rowId]);

  return (
    <div className={`square${selected ? ' selected' : ''}`}
         id={squareId}
         key={squareId}
         onClick={() => onClick(rowId, colId)}
         onKeyDown={handleKeyDown}
         aria-label={`${selected ? 'SELECTED ' : ''} ${squareValue}`}
         tabIndex={0}
    >{squareValue}</div>
  );
}
