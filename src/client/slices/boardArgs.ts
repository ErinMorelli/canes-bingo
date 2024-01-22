import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

import { BoardArgs, UpdateBoardArg } from '@app/types';
import { RootState } from '@app/store';

import { fetchSquares } from './squares.ts';

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const boardArgsSlice = createAppSlice({
  name: 'boardArgs',
  initialState: {} as BoardArgs,
  reducers: (create) => ({
    updateBoardArg: create.asyncThunk(
      (args: UpdateBoardArg, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const newArgs: BoardArgs = {
          ...state.boardArgs,
          [args.groupName]: args.value
        }
        thunkAPI.dispatch(fetchSquares(newArgs));
        return newArgs;
      }, {
        fulfilled: (_, { payload }) => payload
      }
    ),
    updateBoardArgs: create.reducer<BoardArgs>(
      (_, { payload }) => payload
    )
  }),
});

export const { updateBoardArg, updateBoardArgs } = boardArgsSlice.actions;

export const selectBoardArgs = (state: RootState) => state.boardArgs;

export default boardArgsSlice.reducer;
