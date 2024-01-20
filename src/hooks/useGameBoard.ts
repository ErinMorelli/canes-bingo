import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  generateBoard,
  selectBoard,
  selectBroadcast,
  selectGame,
  setBoard,
  updateBroadcast,
  updateGame,
  updateSquare,
} from '../slices';
import { Board } from '../types';
import { getBoardId, parseBoardId } from '../utils';

import { useHash } from './useHash';

type UseGameBoardResult = {
  boardId: string;
  board: Board;
  createBoardId: () => string;
  loadBoard: (hash: string) => void;
  resetBoard: () => void;
  selectSquare: (row: number, col: number) => void;
}

export function useGameBoard(): UseGameBoardResult {
  const dispatch = useDispatch();
  const { hash: boardId, updateHash } = useHash();

  const game = useSelector(selectGame);
  const broadcast = useSelector(selectBroadcast);
  const board = useSelector(selectBoard);

  useEffect(() => {
    const newBoardId = getBoardId(board, { game, broadcast });
    updateHash(newBoardId);
  }, [board, game, broadcast]);

  const loadBoard = useCallback((hash: string) => {
    try {
      const newBoard = parseBoardId(hash);
      if (!newBoard) return;
      dispatch(updateGame(newBoard.boardArgs.game));
      dispatch(updateBroadcast(newBoard.boardArgs.broadcast));
      dispatch(setBoard(newBoard.board));
    } catch (_) {
      return;
    }
  }, [dispatch]);

  const resetBoard = useCallback(() => {
    dispatch(generateBoard({ game, broadcast }));
  }, [broadcast, dispatch, game]);

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

  const createBoardId = useCallback(() => {
    return getBoardId(board, { game, broadcast });
  }, [board, broadcast, game]);

  return {
    boardId,
    board,
    createBoardId,
    loadBoard,
    resetBoard,
    selectSquare,
  };
}
