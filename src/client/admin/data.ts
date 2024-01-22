import axios from 'axios';
import { combineDataProviders, DataProvider } from 'react-admin';

import { API_PREFIX as P, StorageKey } from '@app/constants.ts';
import { getStorageValue } from '@app/utils.ts';

export function withAuth() {
  const token: string = getStorageValue(StorageKey.Token) || '';
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
    const res = await fetch(`${P}/${resource}`, withAuth());
    const json = await res.json()
    const data = json.map((s: { categories: string|null }) => ({
      ...s,
      categories: s.categories
        ? s.categories.split(',').map((c) => parseInt(c))
        : [],
    }));
    return { data, total: data.length };
  },
  getOne: async (resource, params) => {
    const res = await axios.get(`${P}/${resource}/${params.id}`, withAuth());
    const data = {
      ...res.data,
      categories: res.data.categories
        ? res.data.categories.split(',').map((c: string) => parseInt(c))
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
    case 'users':
      return usersProvider;
    case 'config':
    case 'groups':
    case 'categories':
      return baseProvider;
    default:
      console.error('Unknown resource:', resource);
      return baseProvider;
  }
});

export default dataProvider;
