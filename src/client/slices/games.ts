import axios from 'axios';
import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

import { API_PREFIX } from '../constants.ts';
import { RootState } from '../store.ts';
import { Game, Games, GameState } from '../types.ts';

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: GameState = {
  games: [],
  gamesLoaded: false,
  enabled: true,
  selectedGame: undefined,
};

export const gamesSlice = createAppSlice({
  name: 'games',
  initialState,
  reducers: (create) => ({
    fetchGames: create.asyncThunk(
      async () => {
        const url = `${API_PREFIX}/games`;
        const games = await axios.get<Games>(url).then((res) => res.data);
        const defaultGame = games.find(g => g.isDefault);
        return { games, defaultGame };
      },
      {
        fulfilled: (state, { payload }) => {
          state.games = payload.games;
          state.selectedGame = payload.defaultGame;
          state.gamesLoaded = true;
        },
        rejected: (state) => {
          state.gamesLoaded = true;
        },
      }
    ),
    selectGame: create.reducer<Game>((state, { payload }) => {
      state.selectedGame = payload;
    }),
    toggleEnabled: create.reducer<boolean>((state, { payload }) => {
      state.enabled = payload;
    }),
  }),
});

export const { fetchGames, selectGame, toggleEnabled } = gamesSlice.actions;

export const selectGames = (state: RootState) => state.games.games;
export const selectGamesLoaded = (state: RootState) => state.games.gamesLoaded;
export const selectSelectedGame = (state: RootState) => state.games.selectedGame;
export const selectEnabled = (state: RootState) => state.games.enabled;

export default gamesSlice.reducer;
