import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { Popover, Spin } from 'antd';
import { decode } from 'he';

import { BoardSquare } from '@app/types';
import { fetchConfigValue } from '@app/utils';
import { ConfigKey } from '@app/constants.ts';
import { useConfig } from '@hooks';

type SquareProps = {
  square: BoardSquare;
  rowId: number;
  colId: number;
  customClass?: string;
  onClick: (rowId: number, colId: number) => void;
};

function getSquareId(rowId: number, colId: number) {
  return `square-${rowId}-${colId}`;
}

export function CardSquare({ square, rowId, colId, customClass, onClick }: Readonly<SquareProps>) {
  const { selected, value } = square;

  const { showTooltips } = useConfig();

  const squareId = getSquareId(rowId, colId);

  const [squareValue, setSquareValue] = useState<ReactNode>(
    <Spin size="small" />
  );

  const isFreeSpace = useMemo(
    () => rowId === 2 && colId === 2,
    [colId, rowId]
  );

  const squareDescription = useMemo(
    () => isFreeSpace
        ? 'Free space!'
        : value.description,
    [isFreeSpace, value.description]
  );

  const popoverClassNames = useMemo(() => {
    const classes = ['square-tooltip'];
    if (customClass) {
      classes.push(customClass);
    }
    return classes.join(' ');
  }, [customClass]);

  const classNames = useMemo(() => {
    const classes = ['square'];
    if (selected) {
      classes.push('selected');
    }
    if (isFreeSpace) {
      classes.push('free-space');
    }
    return classes.join(' ');
  }, [isFreeSpace, selected]);

  function getNextSquare(key: string, rowId: number, colId: number) {
    let newRowId = rowId, newColId = colId;
    switch (key) {
      case 'arrowup':    newRowId = rowId === 0 ? 4 : rowId - 1; break;
      case 'arrowdown':  newRowId = rowId === 4 ? 0 : rowId + 1; break;
      case 'arrowleft':  newColId = colId === 0 ? 4 : colId - 1; break;
      case 'arrowright': newColId = colId === 4 ? 0 : colId + 1; break;
      default: break;
    }
    return getSquareId(newRowId, newColId);
  }

  useEffect(() => {
    if (isFreeSpace) {
      fetchConfigValue(ConfigKey.FreeSpace)
        .then((freeSpaceValue) => {
          const value = decode(freeSpaceValue);
          setSquareValue(value);
        });
    } else {
      setSquareValue(value.value);
    }
  }, [isFreeSpace, value.value]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.code.toLowerCase();

    if (['enter', 'space'].includes(key)) {
      event.preventDefault();
      onClick(rowId, colId);
    }
    else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      const nextSquareId = getNextSquare(key, rowId, colId);
      document.getElementById(nextSquareId)?.focus();
    }
  }, [colId, onClick, rowId]);

  const squareEl = (
    <div
      className={classNames}
      role="button"
      id={squareId}
      key={squareId}
      onClick={() => onClick(rowId, colId)}
      onKeyDown={handleKeyDown}
      aria-label={`${selected ? 'SELECTED ' : ''} ${squareValue}`}
      tabIndex={0}>
      {squareValue}
    </div>
  );

  return showTooltips ? (
    <Popover
      rootClassName={popoverClassNames}
      mouseEnterDelay={0.5}
      content={squareDescription}
      title={squareValue}>
      {squareEl}
    </Popover>
  ) : squareEl;
}
