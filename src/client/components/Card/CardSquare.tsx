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
import { fetchConfigValue, fitSquareFont } from '@app/utils';
import { ConfigKey } from '@app/constants';

import { useConfig } from '@hooks';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

type SquareProps = {
  square: BoardSquare;
  rowId: number;
  colId: number;
  /** Measured width of one grid cell, or 0 before the board is measured. */
  cellSize?: number;
  /** Total horizontal padding of a cell, measured from the stylesheet. */
  cellPadding?: number;
  customClass?: string;
  onClick: (rowId: number, colId: number) => void;
};

function getSquareId(rowId: number, colId: number) {
  return `square-${rowId}-${colId}`;
}

function CardSquareImpl({ square, rowId, colId, cellSize = 0, cellPadding = 0, customClass, onClick }: Readonly<SquareProps>) {
  const { selected, value } = square;

  const { showTooltips, theme } = useConfig();

  const squareId = getSquareId(rowId, colId);

  const [squareValue, setSquareValue] = useState<ReactNode>(
    <Spin size="small" />
  );

  /** Plain-text form of the label, for canvas measurement. */
  const [squareText, setSquareText] = useState<string>('');

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

    // Selected and free squares render at 700; everything else at 500. The
    // weight changes the measured width, so it has to match the rendered one.
    const fit = fitSquareFont(
      squareText,
      cellSize,
      cellPadding,
      selected || isFreeSpace ? '700' : '500'
    );
    if (fit) {
      style.fontSize = `${fit.fontSize}px`;
      style.lineHeight = `${fit.lineHeight}px`;
    }

    return style;
  }, [cellSize, cellPadding, isFreeSpace, selected, squareText, theme]);

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
          setSquareText(value);
        });
    } else {
      setSquareValue(value.value);
      setSquareText(String(value.value));
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
      {/*
        The square is a flex container, so bare text becomes an anonymous flex
        item with `min-width: auto` — it refuses to shrink below its longest
        unbreakable token and `overflow-wrap` never applies. An explicit span
        that may shrink is what lets a label like `"MISTER ANDERSEN!"` break.
      */}
      <span className="square-label">{squareValue}</span>
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

/**
 * Marking one square replaces the board array, so all 25 squares re-render —
 * and each one mounts an antd Popover, which made that a 16-35ms synchronous
 * pass. Only the square that was tapped gets a new `square` object, so the
 * other 24 bail out here. `onClick` must stay referentially stable for this to
 * hold; Card wraps it in useCallback.
 */
export const CardSquare = React.memo(CardSquareImpl);
