import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  BoardArgs,
  GroupResult,
  GroupsStateGroups,
  SingleGroup,
  Group as G,
} from '@app/types';
import { Group } from '@app/constants';
import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

export function useGroups() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const result = await apiClient.provide(Api.groups.list, {});
      return getData(result).items;
    },
    staleTime: 10 * 60 * 1000,
  });

  const groups = useMemo(() => {
    const map = {} as GroupsStateGroups;
    data.forEach((group) => {
      if (!(Group.AllGroups as readonly string[]).includes(group.name)) return;
      map[group.name as G] = group as GroupResult;
    });
    return map;
  }, [data]);

  const defaultArgs = useMemo(() => {
    const args = {} as BoardArgs;
    data.forEach((group) => {
      if (!(Group.AllGroups as readonly string[]).includes(group.name)) return;
      const defaultCat = (group.categories ?? []).find((c) => c.isDefault);
      if (defaultCat) args[group.name as SingleGroup] = defaultCat;
    });
    return args;
  }, [data]);

  return { groups, defaultArgs, isLoading };
}
