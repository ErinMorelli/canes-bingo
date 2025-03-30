import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../store.ts';
import { GroupsStateGroups } from '../types.ts';
import { fetchGroups, selectGroups, selectGroupsLoaded } from '@slices';

type UseGroupsResult = {
  groups: GroupsStateGroups;
  loadGroups: () => void;
  groupsLoaded: boolean;
};

export function useGroups(): UseGroupsResult {
  const dispatch = useAppDispatch();

  const groups = useSelector(selectGroups);
  const groupsLoaded = useSelector(selectGroupsLoaded);

  const loadGroups = useCallback(() => {
    if (!groupsLoaded) dispatch(fetchGroups(undefined));
  }, [dispatch, groupsLoaded]);

  return {
    groups,
    loadGroups,
    groupsLoaded,
  };
}
