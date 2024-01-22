import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Board, UpdateSquareArgs } from '@app/types';
import { RootState } from '@app/store';

export const boardSlice = createSlice({
  name: 'board',
  initialState: [] as Board,
  reducers: {
    updateSquare: (
      state,
      { payload }: PayloadAction<UpdateSquareArgs>
    ) => {
      const { row, col, value } = payload;
      state[row][col] = value;
    },
    setBoard: (_, { payload }: PayloadAction<Board>) => payload,
  },
});

export const { updateSquare, setBoard } = boardSlice.actions;

export const selectBoard = (state: RootState) => state.board;

export default boardSlice.reducer;
