import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import type {
  ComponentPropsWithoutRef,
  ReactNode,
  KeyboardEvent
} from 'react';
import { Popover, Spin } from 'antd';

import { BoardSquare } from '@app/types';
import { fitSquareFont } from '@app/utils';

import { useConfig } from '@hooks';

const WHITE = '#FFFFFF';
const BLACK = '#000000';

/** antd's own hover delay, unchanged from before. */
const TOOLTIP_HOVER_DELAY_SECONDS = 0.5;

type SquareButtonProps = ComponentPropsWithoutRef<'button'> & {
  describedById?: string;
};

/**
 * Popover clones its child and injects its own `aria-describedby`, which
 * points at the tooltip while it is open and is `undefined` while it is
 * closed — so it silently wiped the square's own description reference in the
 * state that matters most. Re-applying ours after spreading the clone's props
 * keeps the description referenced in both states, and needs a real component
 * (not a bare element) because cloneElement's props always win otherwise.
 *
 * Module scope, not inline: an inline component gets a new identity every
 * render, which would remount the button and drop focus mid keyboard
 * navigation.
 */
const SquareButton = forwardRef<HTMLButtonElement, SquareButtonProps>(
  function SquareButton({ describedById, children, ...rest }, ref) {
    return (
      <button ref={ref} {...rest} aria-describedby={describedById}>
        {children}
      </button>
    );
  }
);

type SquareProps = {
  square: BoardSquare;
  rowId: number;
  colId: number;
  /** Measured width of one grid cell, or 0 before the board is measured. */
  cellSize?: number;
  /** Total horizontal padding of a cell, measured from the stylesheet. */
  cellPadding?: number;
  /** This square is part of the pattern the player has just completed. */
  isWinning?: boolean;
  customClass?: string;
  onClick: (rowId: number, colId: number) => void;
};

function getSquareId(rowId: number, colId: number) {
  return `square-${rowId}-${colId}`;
}

function CardSquareImpl({ square, rowId, colId, cellSize = 0, cellPadding = 0, isWinning = false, customClass, onClick }: Readonly<SquareProps>) {
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

  /**
   * A Popover's content never reaches assistive tech, so the description — the
   * only explanation of what a square means — was pointer-only. It ships as a
   * visually hidden node the button points at instead, which screen readers
   * announce after the label.
   *
   * Follows `showTooltips`: that switch is the user's stated preference on
   * whether square meanings are surfaced at all, so it applies in every
   * modality rather than only the visual one.
   */
  /**
   * Whether this square has a meaning worth surfacing at all. The free space
   * already says FREE on its face, so a tooltip repeating it is noise — which
   * keyboard navigation would otherwise hit every time it crossed the centre.
   */
  const explainable = useMemo(
    () => showTooltips && !isFreeSpace && Boolean(squareDescription),
    [showTooltips, isFreeSpace, squareDescription]
  );

  const describedById = explainable ? `${squareId}-description` : undefined;

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
    if (isWinning) {
      classes.push('winning');
    }
    return classes.join(' ');
  }, [isFreeSpace, isWinning, selected, theme.name]);

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
      const value = 'FREE';
      setSquareValue(value);
      setSquareText(value);
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
    <SquareButton
      type="button"
      className={classNames}
      style={styles}
      id={squareId}
      onClick={() => handleClick(rowId, colId)}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      aria-label={squareAriaLabel}
      describedById={describedById}>
      {/*
        The square is a flex container, so bare text becomes an anonymous flex
        item with `min-width: auto` — it refuses to shrink below its longest
        unbreakable token and `overflow-wrap` never applies. An explicit span
        that may shrink is what lets a label like `"MISTER ANDERSEN!"` break.
      */}
      <span className="square-label">{squareValue}</span>
      {/*
        Must be clipped rather than `display: none` — a hidden node is dropped
        from the accessibility tree and cannot be referenced by
        aria-describedby. It sits inside the button because the Popover clones
        a single child, and `aria-label` keeps it out of the accessible name.
      */}
      {describedById && (
        <span className="sr-only" id={describedById}>
          {squareDescription}
        </span>
      )}
    </SquareButton>
  );

  /*
    Mounted unconditionally. Gating the wrapper itself meant the Popover could
    unmount while it was open — `squareDescription` changes on every
    regenerated card — which abandoned its portal: a bubble left on screen
    with no trigger left to close it. It would also remount the button,
    dropping focus mid keyboard navigation. So `explainable` decides the
    `content` instead, and antd declines to open an empty one.

    `open` is deliberately NOT controlled. Driving it from state left the
    popup mounted and aligned but stuck at opacity 0 — the enter motion never
    completed — so a tooltip only became visible once some later render forced
    a repaint, which read as "appears on click, not on hover".
  */
  return (
    <Popover
      rootClassName={popoverClassNames}
      mouseEnterDelay={TOOLTIP_HOVER_DELAY_SECONDS}
      content={explainable ? squareDescription : null}>
      {squareEl}
    </Popover>
  );
}

/**
 * Marking one square replaces the board array, so all 25 squares re-render —
 * and each one mounts an antd Popover, which made that a 16-35ms synchronous
 * pass. Only the square that was tapped gets a new `square` object, so the
 * other 24 bail out here. `onClick` must stay referentially stable for this to
 * hold; Card wraps it in useCallback.
 */
export const CardSquare = React.memo(CardSquareImpl);
