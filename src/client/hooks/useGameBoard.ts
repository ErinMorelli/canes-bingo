import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectBoard,
  updateSquare,
  updateBoardArgs,
  selectDefaultArgs, selectBoardArgs, selectSelectedGame,
} from '@slices';

import { Board, BoardArgs, Pattern } from '@app/types';
import { validateBoardPattern } from '@app/utils.ts';

import { useSquares } from './useSquares.ts';

type UseGameBoardResult = {
  board: Board;
  boardReady: boolean;
  loadBoard: (force?: boolean) => void;
  selectSquare: (row: number, col: number) => void;
  validateGameBoard: () => boolean;
  generateBoard: (boardArgs: BoardArgs) => void;
  squaresError: boolean;
}

export function useGameBoard(): UseGameBoardResult {
  const dispatch = useDispatch();
  const { generateBoard, squaresError } = useSquares();

  const board = useSelector(selectBoard);
  const boardArgs = useSelector(selectBoardArgs);
  const defaultArgs = useSelector(selectDefaultArgs);

  const selectedGame = useSelector(selectSelectedGame);

  const shouldLoadBoard = useMemo(
    () => !board.length || !Object.keys(boardArgs).length,
    [board, boardArgs]
  );

  const loadBoard = useCallback((force = false) => {
    if (shouldLoadBoard || force) {
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

  const validateGameBoard = useCallback(() => {
    const patterns = selectedGame?.patterns || [];
    return patterns.some((pattern: Pattern) => {
      return validateBoardPattern(board, pattern);
    });
  }, [board, selectedGame]);

  const boardReady = useMemo(
    () => !!board && board.length > 0,
    [board]
  );

  return {
    board,
    boardReady,
    loadBoard,
    selectSquare,
    validateGameBoard,
    generateBoard,
    squaresError,
  };
}
