import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { BoardArgs, Broadcast, Game } from '../types';
import { updateBoardArgs } from './index.ts';

const initialState: BoardArgs = {
  game: Game.HOME,
  broadcast: Broadcast.LOCAL
};

export const boardArgsSlice = createSlice({
  name: 'boardArgs',
  initialState,
  reducers: {
    updateGame: (state, action: PayloadAction<Game>) => {
      state.game = action.payload;
    },
    updateBroadcast: (state, action: PayloadAction<Broadcast>) => {
      state.broadcast = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateBoardArgs, (_, { payload }) => payload);
  },
});

export const { updateBroadcast, updateGame  } = boardArgsSlice.actions

export const selectGame = (state: RootState) => state.boardArgs.game;
export const selectBroadcast = (state: RootState) => state.boardArgs.broadcast;
