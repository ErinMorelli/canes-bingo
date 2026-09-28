import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { useGameBoard } from '@hooks';

import { BoardSquare } from '@app/types';
import { squareKey } from '@app/utils';

import { CardSquare } from './CardSquare';

type CardProps = {
  customClass?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass }: CardProps, ref) => {
    const { board, selectSquare, winningSquares } = useGameBoard();

    // The grid is 5 equal fluid columns, so one measurement sizes every
    // square. Measuring the grid rather than a cell keeps this to a single
    // observer instead of 25.
    const gridRef = useRef<HTMLDivElement | null>(null);
    const [metrics, setMetrics] = useState({ cellSize: 0, cellPadding: 0 });

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        gridRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      const node = gridRef.current;
      if (!node) return;

      const measure = () => {
        const gap = Number.parseFloat(getComputedStyle(node).columnGap) || 0;
        const width = node.getBoundingClientRect().width;
        if (!width) return;

        // Padding comes off a real square so the stylesheet stays the only
        // place it is defined.
        const square = node.querySelector('.square');
        const padding = square
          ? Number.parseFloat(getComputedStyle(square).paddingLeft) * 2
          : 0;

        setMetrics({ cellSize: (width - gap * 4) / 5, cellPadding: padding });
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);

      // Canvas text measurement before Inter loads reports the fallback
      // metrics, which sizes every square off by a step.
      void document.fonts?.ready.then(measure);

      return () => observer.disconnect();
    }, []);

    // Stable, so the 24 squares that did not change can bail out of the
    // re-render that marking the 25th triggers.
    const handleClick = useCallback(
      (rowId: number, coldId: number) => selectSquare(rowId, coldId),
      [selectSquare]
    );

    const generateRow = (row: BoardSquare[], rowId: number) => {
      if (!row) return [];
      return row.map((square, colId) => (
        <CardSquare
          key={`${rowId}-${colId}`}
          square={square}
          rowId={rowId}
          colId={colId}
          cellSize={metrics.cellSize}
          cellPadding={metrics.cellPadding}
          isWinning={winningSquares.has(squareKey({ row: rowId, col: colId }))}
          customClass={customClass}
          onClick={handleClick}
        />
      ))
    };

    return (
      <div className="bingo" ref={setRefs}>
        {board.map((row, rowId) =>
          row ? generateRow(row, rowId) : null)}
      </div>
    );
  }
);
