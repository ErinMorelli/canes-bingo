import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash.isequal';

import {
  selectBoard,
  updateSquare,
  updateBoardArgs,
  selectDefaultArgs, selectBoardArgs,
} from '@slices';
import { Board } from '@app/types';

import { useSquares } from './useSquares.ts';

type UseGameBoardResult = {
  board: Board;
  boardReady: boolean;
  loadBoard: () => void;
  selectSquare: (row: number, col: number) => void;
}

export function useGameBoard(): UseGameBoardResult {
  const dispatch = useDispatch();
  const { generateBoard } = useSquares();

  const board = useSelector(selectBoard);
  const boardArgs = useSelector(selectBoardArgs);
  const defaultArgs = useSelector(selectDefaultArgs);

  const shouldLoadBoard = useMemo(
    () => (
      !board.length ||
      !Object.keys(boardArgs).length ||
      !isEqual(boardArgs, defaultArgs)
    ),
    [board, boardArgs, defaultArgs]
  );

  const loadBoard = useCallback(() => {
    if (shouldLoadBoard) {
      dispatch(updateBoardArgs(defaultArgs));
      generateBoard(defaultArgs);
    }
  }, [defaultArgs, dispatch, generateBoard, shouldLoadBoard]);

  const selectSquare = useCallback((row: number, col: number) => {
    const square = board[row][col];
    dispatch(updateSquare({
      row,
      col,
      value: {
        ...square,
        selected: !square.selected
      }
    }));
  }, [board, dispatch]);

  const boardReady = useMemo(
    () => !!board && board.length > 0,
    [board]
  );

  return {
    board,
    boardReady,
    loadBoard,
    selectSquare,
  };
}
