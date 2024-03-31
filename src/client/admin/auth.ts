import axios from 'axios';
import { AuthProvider } from 'react-admin';

import { API_PREFIX as P, StorageKey } from '@app/constants.ts';
import { removeStorageValue, setStorageValue } from '@app/utils.ts';

import { withAuth } from './data.ts';

const getUserSession = async () => {
  try {
    const { data: user } = await axios.get(`${P}/session`, withAuth());
    return Promise.resolve(user);
  } catch (err) {
    return Promise.reject(err);
  }
};

const authProvider: AuthProvider = {
  login: async (params) => {
    try {
      const { data } = await axios.post(`${P}/login`, params);
      setStorageValue(StorageKey.Token, data.token);
      return Promise.resolve({ redirectTo: '/admin' });
    } catch (err) {
      return Promise.reject(err);
    }
  },
  logout: async () => {
    try {
      await axios.post(`${P}/logout`);
      removeStorageValue(StorageKey.Token);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
  getIdentity: getUserSession,
  checkAuth: getUserSession,
  checkError: async ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem(StorageKey.Token);
      await axios.post(`${P}/logout`);
      return Promise.reject(new Error());
    }
    return Promise.resolve();
  },
  // Unused
  handleCallback: <T>() =>  Promise.resolve({} as T),
  getPermissions: <T>() =>  Promise.resolve({} as T),
};

export default authProvider;
