import React, { type KeyboardEvent, useCallback, useMemo } from 'react';
import { FieldProps, InputProps, useFieldValue } from 'react-admin';
import { useController } from 'react-hook-form';

import { PATTERN_COLUMNS, PATTERN_ROWS } from '@app/constants.ts';
import { PatternSquare } from '@app/types.ts';
import {
  getSquareClasses,
  getSquareStyle,
  parsePatternValue
} from '@app/utils.ts';

type PatternGridProps = {
  readonly selected: PatternSquare[];
  readonly size?: number;
  readonly onSelect?: (row: number, col: number) => void;
  readonly onKey?: (e: KeyboardEvent, row: number, col: number) => void;
};

type PatternInputProps = InputProps & {
  readonly size?: number;
  readonly name: string;
};

type PatternFieldProps = FieldProps & {
  readonly size?: number;
};

function PatternGrid({ selected, size, onSelect, onKey }: PatternGridProps) {
  const style = useMemo<React.CSSProperties>(
    () => getSquareStyle(size),
    [size]
  );

  const squareClasses = useCallback(
    (row: number, col: number) => getSquareClasses(row, col, selected),
    [selected]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent, row: number, col: number) => {
    if (onKey) onKey(e, row, col);
  }, [onKey]);

  const handleSelectSquare = useCallback((row: number, col: number) => {
    if (onSelect) onSelect(row, col);
  }, [onSelect]);

  return (
    <div className="table">
      {PATTERN_ROWS.map((row) => (
        <div className={`row row-${row}`} key={`row-${row}`}>
          {PATTERN_COLUMNS.map((col) => (
            <div
              role="button"
              tabIndex={0}
              key={`square-${row}-${col}`}
              className={squareClasses(row, col)}
              style={style}
              onKeyDown={(e) => handleKeyDown(e, row, col)}
              onClick={() => handleSelectSquare(row, col)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function PatternInput({ name, size }: PatternInputProps) {
  const input = useController({
    name,
    defaultValue: ''
  });

  const { onChange } = input.field;

  const selected = useMemo<PatternSquare[]>(
    () => parsePatternValue(input.field.value),
    [input.field.value]
  );

  const selectSquare = useCallback((row: number, col: number) => {
    const newSelected = [...selected];

    const idx = selected.findIndex((s) => s.col === col && s.row === row);

    if (idx < 0) {
      newSelected.push({ row, col });
    } else {
      newSelected.splice(idx, 1);
    }

    onChange(newSelected);
  }, [selected, onChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, row: number, col: number) => {
      const key = event.code.toLowerCase();

      if (['enter', 'space'].includes(key)) {
        event.preventDefault();
        selectSquare(row, col);
      }
    },
    [selectSquare]
  );

  return (
    <div className="pattern-input">
      <input
        hidden
        readOnly
        type="text"
        name={input.field.name}
        value={JSON.stringify(input.field.value)}
      />
      <PatternGrid
        size={size}
        selected={selected}
        onKey={handleKeyDown}
        onSelect={selectSquare}
      />
    </div>
  );
}

export function PatternField({ size, ...props }: PatternFieldProps) {
  const value = useFieldValue(props);

  const selected = useMemo<PatternSquare[]>(
    () => parsePatternValue(value),
    [value]
  );

  return (
    <div className="pattern-field">
      <PatternGrid size={size} selected={selected} />
    </div>
  )
}
