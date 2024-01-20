import { configureStore } from '@reduxjs/toolkit';

import { boardSlice, boardArgsSlice } from './slices';

const store = configureStore({
  reducer: {
    board: boardSlice.reducer,
    boardArgs: boardArgsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
