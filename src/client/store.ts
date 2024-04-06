import { persistReducer, persistStore } from 'redux-persist';
import { configureStore, Reducer } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import storage from 'redux-persist/lib/storage';
import { PERSIST } from 'redux-persist/lib/constants';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import { StorageKey } from '@app/constants.ts';

import rootReducer from './slices';

const persistedReducer: Reducer = persistReducer<RootState>({
  key: StorageKey.App,
  keyPrefix: '',
  storage,
  whitelist: ['board', 'boardArgs'],
  stateReconciler: autoMergeLevel2,
}, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [PERSIST],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export default {
  store,
  persistor
};
