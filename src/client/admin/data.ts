import axios, { AxiosRequestConfig } from 'axios';
import { combineDataProviders, DataProvider } from 'react-admin';

import { API_PREFIX as P, StorageKey } from '@app/constants.ts';
import { getStorageValue } from '@app/utils.ts';
import { Pattern, Patterns } from '@app/types.ts';

export function withAuth(): AxiosRequestConfig {
  const token: string = getStorageValue(StorageKey.Token) ?? '';
  return {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

const baseProvider: DataProvider = {
  getList: async (resource) => {
    const { data } = await axios.get(`${P}/${resource}`, withAuth());
    return { data, total: data.length };
  },
  getMany: async (resource) => {
    const { data } = await axios.get(`${P}/${resource}`, withAuth());
    return { data, total: data.length };
  },
  getOne: async (resource, params) => {
    const { data } = await axios.get(`${P}/${resource}/${params.id}`, withAuth());
    return { data };
  },
  update: async (resource, params) => {
    const { data } = await axios.put(
      `${P}/${resource}/${params.id}`,
      params.data,
      withAuth(),
    );
    return { data };
  },
  create: async (resource, params) => {
    const { data } = await axios.post(`${P}/${resource}`, params.data, withAuth());
    return { data };
  },
  delete: async (resource, params) => {
    const { data } = await axios.delete(`${P}/${resource}/${params.id}`, withAuth());
    return { data };
  },
  getManyReference: async (resource, params) => {
    const { target, id } = params;
    const { data } = await axios.get(`${P}/${resource}?${target}=${id}`, withAuth());
    return { data, total: data.length };
  },
  deleteMany: <T>() =>  Promise.resolve({} as T),
  updateMany: <T>() =>  Promise.resolve({} as T),
};

const squaresProvider: DataProvider = {
  ...baseProvider,
  getList: async (resource) => {
    const res = await axios.get(`${P}/${resource}`, withAuth());
    const data = res.data.map((s: { categories: string|null }) => ({
      ...s,
      categories: s.categories
        ? s.categories.split(',').map((c) => Number.parseInt(c))
        : [],
    }));
    return { data, total: data.length };
  },
  getOne: async (resource, params) => {
    const res = await axios.get(`${P}/${resource}/${params.id}`, withAuth());
    const data = {
      ...res.data,
      categories: res.data.categories
        ? res.data.categories.split(',').map((c: string) => Number.parseInt(c))
        : [],
    }
    return { data };
  },
  update: async (resource, params) => {
    const prevCats = params.previousData.categories;
    const cats = params.data.categories;

    const removed = prevCats.filter((p: number) => !cats.includes(p));
    const added = cats.filter((c: number) => !prevCats.includes(c));

    const { data } = await axios.put(
      `${P}/${resource}/${params.id}`,
      {
        ...params.data,
        categories: { added, removed }
      },
      withAuth(),
    );
    return { data };
  },
};

const gamesProvider: DataProvider = {
  ...baseProvider,
  getList: async (resource) => {
    const res = await axios.get(`${P}/${resource}`, withAuth());
    const data = res.data.map((g: { patterns: Patterns }) => {
      const patterns = g.patterns || [];
      return {
        ...g,
        patternIds: patterns.map(p => p.id),
      };
    });
    return { data, total: data.length };
  },
  getOne: async (resource, params) => {
    const res = await axios.get(`${P}/${resource}/${params.id}`, withAuth());
    const patterns = res.data.patterns || [];
    const data = {
      ...res.data,
      patternIds: patterns.map((p: Pattern) => p.id),
    };
    return { data };
  },
  update: async (resource, params) => {
    const prevPats = params.previousData.patternIds;
    const pats = params.data.patternIds;

    const { patternIds: _, ...paramData} = params.data;

    const removed = prevPats.filter((p: number) => !pats.includes(p));
    const added = pats.filter((p: number) => !prevPats.includes(p));

    const { data } = await axios.put(
      `${P}/${resource}/${params.id}`,
      {
        ...paramData,
        patterns: { added, removed }
      },
      withAuth(),
    );
    return { data };
  },
  create: async (resource, params) => {
    const { patternIds: patterns = [], ...paramData } = params.data;
    const { data } = await axios.post(
      `${P}/${resource}`,
      { ...paramData, patterns },
      withAuth(),
    );
    return { data };
  },
}

const usersProvider: DataProvider = {
  ...baseProvider,
  create: async (_resouce, params) => {
    const { data } = await axios.post(`${P}/register`, params.data);
    return { data };
  }
};

const dataProvider = combineDataProviders((resource) => {
  switch (resource) {
    case 'squares':
      return squaresProvider;
    case 'games':
      return gamesProvider;
    case 'users':
      return usersProvider;
    case 'config':
    case 'groups':
    case 'categories':
    case 'patterns':
      return baseProvider;
    default:
      console.error('Unknown resource:', resource);
      return baseProvider;
  }
});

export default dataProvider;
