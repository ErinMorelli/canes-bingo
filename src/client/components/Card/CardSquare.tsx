import React, {
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
import { ConfigKey } from '@app/constants';

import { useConfig } from '@hooks';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

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

  const { showTooltips, theme } = useConfig();

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
        ? 'FREE'
        : value.description,
    [isFreeSpace, value.description]
  );

  const squareAriaLabel = useMemo(() => {
    return isFreeSpace ? 'Free space' : `${String(value.value)}`;
  }, [isFreeSpace, value.value]);

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
      classes.push(theme.name);
    }
    return classes.join(' ');
  }, [isFreeSpace, selected, theme.name]);

  const styles = useMemo(() => {
    const isDark = theme.name === 'dark';

    const style: React.CSSProperties = {
      color: theme.config?.token?.colorText,
      backgroundColor: isDark ? theme.config?.token?.colorBgContainer : theme.config?.token?.colorBgBase,
      borderColor: theme.config?.token?.colorBorder,
    };
    if (selected) {
      style.backgroundColor = theme.config?.token?.colorPrimary;
      style.color = WHITE;
    }
    if (isFreeSpace) {
      style.backgroundColor = theme.config.token?.colorText;
      style.color = isDark ? BLACK : WHITE;
    }
    return style;
  }, [isFreeSpace, selected, theme]);

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

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const key = event.code.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      const nextSquareId = getNextSquare(key, rowId, colId);
      document.getElementById(nextSquareId)?.focus();
    }
  }, [colId, rowId]);

  const handleClick = useCallback((rowId: number, colId: number) => {
    if (isFreeSpace) return;
    onClick(rowId, colId);
  }, [isFreeSpace, onClick]);

  const squareEl = (
    <button
      type="button"
      className={classNames}
      style={styles}
      id={squareId}
      onClick={() => handleClick(rowId, colId)}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      aria-label={squareAriaLabel}>
      {squareValue}
    </button>
  );

  return showTooltips ? (
    <Popover
      rootClassName={popoverClassNames}
      mouseEnterDelay={0.5}
      content={squareDescription}>
      {squareEl}
    </Popover>
  ) : squareEl;
}
