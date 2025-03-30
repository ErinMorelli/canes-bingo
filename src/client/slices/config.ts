import {
  asyncThunkCreator,
  buildCreateSlice,
} from '@reduxjs/toolkit';
import { ConfigResult, ConfigState } from '@app/types.ts';
import { ConfigKey} from '@app/constants.ts';
import { RootState } from '@app/store.ts';
import { fetchConfigValue as getConfigValue } from '@app/utils.ts';

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const configSlice = createAppSlice({
  name: 'config',
  initialState: {} as ConfigState,
  reducers: (create) => ({
    fetchConfigValue: create.asyncThunk(
      async (key: ConfigKey) => {
        const value = await getConfigValue(key);
        return { key, value };
      },
      {
        fulfilled: (state, { payload }) => {
          state[payload.key] = payload.value;
        }
      }
    ),
    updateConfigValue: create.reducer<ConfigResult>(
      (state, { payload }) => {
        state[payload.key] = payload.value;
      }
    ),
  })
});

export const { fetchConfigValue, updateConfigValue } = configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
