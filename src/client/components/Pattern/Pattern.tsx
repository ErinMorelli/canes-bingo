import React, { useCallback, useMemo } from 'react';

import { PATTERN_COLUMNS, PATTERN_ROWS } from '@app/constants.ts';
import { PatternSquare } from '@app/types.ts';
import { getSquareClasses, getSquareStyle } from '@app/utils.ts';

type PatternProps = {
  readonly selected: Array<PatternSquare>;
  readonly size?: number;
}

export function Pattern({ selected, size }: PatternProps) {
  const style = useMemo<React.CSSProperties>(
    () => getSquareStyle(size),
    [size]
  );

  const squareClasses = useCallback(
    (row: number, col: number) => getSquareClasses(row, col, selected),
    [selected]
  );

  return (
    <div className="pattern-field">
      <div className="table">
        {PATTERN_ROWS.map((row) => (
          <div className={`row row-${row}`} key={`row-${row}`}>
            {PATTERN_COLUMNS.map((col) => (
              <div
                key={`square-${row}-${col}`}
                className={squareClasses(row, col)}
                style={style}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
