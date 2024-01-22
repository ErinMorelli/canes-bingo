import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  fetchSquares,
  selectSquares,
  selectSquaresLoaded,
} from '@slices';

import { MIN_SQUARE_COUNT } from '../constants.ts';
import { BoardArgs, Squares } from '../types.ts';
import { useAppDispatch } from '../store.ts';


type UseSquareResult = {
  squares: Squares;
  squaresLoaded: boolean;
  squaresError: boolean;
  generateBoard: (boardArgs: BoardArgs) => void;
}

export function useSquares(): UseSquareResult {
  const dispatch = useAppDispatch();

  const squares = useSelector(selectSquares);
  const squaresLoaded = useSelector(selectSquaresLoaded);

  const squaresError = useMemo(
    () => squaresLoaded && squares.length < MIN_SQUARE_COUNT,
    [squaresLoaded, squares]
  );

  function generateBoard(boardArgs: BoardArgs) {
    dispatch(fetchSquares(boardArgs));
  }

  return {
    squares,
    squaresLoaded,
    squaresError,
    generateBoard
  };
}
