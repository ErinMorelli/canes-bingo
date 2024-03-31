import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

import {
  BoardArgs,
  GroupsState,
  GroupsStateGroups,
  SingleGroup,
  Group as G,
} from '../types.ts';
import { Group } from '../constants.ts';
import { RootState } from '../store.ts';
import { fetchGroup } from '../utils.ts';

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const getGroups = () => Promise
  .all(Group.AllGroups.map(fetchGroup))
  .then((results) => {
    const groups = {} as GroupsStateGroups;
    const defaultArgs = {} as BoardArgs;
    results.forEach(({ group, groupName }) => {
      const defaultArg = group.categories.find(c => c.isDefault);
      if (defaultArg) {
        defaultArgs[groupName as SingleGroup] = defaultArg;
      }
      groups[groupName as G] = group;
    });
    return { groups, defaultArgs, loaded: true };
  });

export const groupsSlice = createAppSlice({
  name: 'groups',
  initialState: {
    loaded: false,
  } as GroupsState,
  reducers: (create) => ({
    fetchGroups: create.asyncThunk(
      async () => await getGroups(),
      {
        fulfilled: (_, { payload }) =>  payload
      }
    ),
  }),
});

export const { fetchGroups } = groupsSlice.actions;

export const selectGroups = (state: RootState) => state.groups.groups;
export const selectDefaultArgs = (state: RootState) => state.groups.defaultArgs;
export const selectGroupsLoaded = (state: RootState) => state.groups.loaded;

export default groupsSlice.reducer;
