import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { Board, BoardArgs, Broadcast, Game, UpdateBoardArgs } from '../types';
import { createBoard } from '../utils.ts';

const initialState: Board = createBoard({
  game: Game.HOME,
  broadcast: Broadcast.LOCAL
});

export const generateBoard = createAction<BoardArgs>('generateBoard');
export const setBoard = createAction<Board>('setBoard');

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    updateSquare: (state, action: PayloadAction<UpdateBoardArgs>) => {
      const { row, col, value } = action.payload;
      state[row][col] = value;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(generateBoard, (_, { payload }) => createBoard(payload));
    builder.addCase(setBoard, (_, { payload }) => payload);
  }
})

export const { updateSquare } = boardSlice.actions;

export const selectBoard = (state: RootState) => state.board;

export default boardSlice.reducer;
