import { configureStore } from '@reduxjs/toolkit';

import boardReducer from './slices/board';
import boardArgsReducer from './slices/boardArgs';

const store = configureStore({
  reducer: {
    board: boardReducer,
    boardArgs: boardArgsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
