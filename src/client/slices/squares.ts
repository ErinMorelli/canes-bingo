import axios from 'axios';
import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

import { RootState } from '../store.ts';
import { API_PREFIX } from '../constants.ts';
import { BoardArgs, SquaresState } from '../types.ts';
import { convertArgsToString, createBoard } from '../utils.ts';

import { setBoard } from './board.ts';

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: SquaresState = {
  squares: [],
  squaresLoaded: false,
};

export const squaresSlice = createAppSlice({
  name: 'squares',
  initialState,
  reducers: (create) => ({
    fetchSquares: create.asyncThunk(
      async (boardArgs: BoardArgs, { dispatch, getState }) => {
        const baseUrl = `${API_PREFIX}/squares`;
        const params: { include?: string; exclude?: string; } = {};
        const groups = (getState() as RootState).groups.groups;

        const [ includes, excludes ] = convertArgsToString(boardArgs, groups);
        if (includes) params.include = includes;
        if (excludes) params.exclude = excludes;

        const urlParams = new URLSearchParams(params);
        const url = `${baseUrl}?${urlParams.toString()}`;

        const newSquares = await axios.get(url).then((res) => res.data);
        const board = createBoard(newSquares);
        dispatch(setBoard(board));

        return newSquares;
      },
      {
        fulfilled: (state, { payload }) => {
          state.squares = payload;
          state.squaresLoaded = true;
        },
      }
    ),
  }),
});

export const { fetchSquares } = squaresSlice.actions;

export const selectSquares = (state: RootState) => state.squares.squares;
export const selectSquaresLoaded = (state: RootState) => state.squares.squaresLoaded;

export default squaresSlice.reducer;
