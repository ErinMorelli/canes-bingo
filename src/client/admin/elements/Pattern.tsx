import React, { type KeyboardEvent, useCallback, useMemo } from 'react';

import { PATTERN_COLUMNS, PATTERN_ROWS } from '@app/constants';
import { PatternSquare } from '@app/types';
import { getSquareClasses, getSquareStyle, parsePatternValue } from '@app/utils';

type PatternGridProps = {
  readonly selected: PatternSquare[];
  readonly size?: number;
  readonly onSelect?: (row: number, col: number) => void;
  readonly onKey?: (e: KeyboardEvent, row: number, col: number) => void;
};

type PatternInputProps = {
  readonly value?: PatternSquare[];
  readonly onChange?: (v: PatternSquare[]) => void;
  readonly size?: number;
};

type PatternFieldProps = {
  readonly value?: PatternSquare[] | string;
  readonly size?: number;
};

function PatternGrid({ selected, size, onSelect, onKey }: PatternGridProps) {
  const style = useMemo<React.CSSProperties>(() => getSquareStyle(size), [size]);
  const squareClasses = useCallback(
    (row: number, col: number) => getSquareClasses(row, col, selected),
    [selected]
  );

  return (
    <div className="table">
      {PATTERN_ROWS.map((row) => (
        <div className={`row row-${row}`} key={`row-${row}`}>
          {PATTERN_COLUMNS.map((col) => {
            const interactive = !!(onSelect || onKey);
            const isSelected = selected.some((s) => s.row === row && s.col === col);
            return (
              <div
                key={`square-${row}-${col}`}
                className={squareClasses(row, col)}
                style={style}
                {...(interactive ? {
                  role: 'button' as const,
                  tabIndex: 0,
                  'aria-pressed': isSelected,
                  onKeyDown: (e: KeyboardEvent) => onKey?.(e, row, col),
                  onClick: () => onSelect?.(row, col),
                } : {})}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function PatternInput({ value, onChange, size }: PatternInputProps) {
  const selected = useMemo<PatternSquare[]>(() => parsePatternValue(value ?? []), [value]);

  const selectSquare = useCallback((row: number, col: number) => {
    const idx = selected.findIndex((s) => s.col === col && s.row === row);
    const next = [...selected];
    if (idx < 0) next.push({ row, col });
    else next.splice(idx, 1);
    onChange?.(next);
  }, [selected, onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent, row: number, col: number) => {
    if (['enter', 'space'].includes(e.code.toLowerCase())) {
      e.preventDefault();
      selectSquare(row, col);
    }
  }, [selectSquare]);

  return (
    <div className="pattern-input">
      <PatternGrid size={size} selected={selected} onKey={handleKeyDown} onSelect={selectSquare} />
    </div>
  );
}

export function PatternField({ value, size }: PatternFieldProps) {
  const selected = useMemo<PatternSquare[]>(() => parsePatternValue(value ?? []), [value]);
  return (
    <div className="pattern-field">
      <PatternGrid size={size} selected={selected} />
    </div>
  );
}
