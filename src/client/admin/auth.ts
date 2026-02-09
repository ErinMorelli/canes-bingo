import axios from 'axios';
import { AuthProvider } from 'react-admin';

import { API_PREFIX as P, StorageKey } from '@app/constants.ts';
import { removeStorageValue, setStorageValue } from '@app/utils.ts';

import { withAuth } from './data.ts';

const getUserSession = async () => {
  const { data: user } = await axios.get(`${P}/session`, withAuth());
  return user;
};

const authProvider: AuthProvider = {
  login: async (params) => {
    const { data } = await axios.post(`${P}/login`, params);
    setStorageValue(StorageKey.Token, data.token);
    return { redirectTo: '/admin' };
  },
  logout: async () => {
    await axios.post(`${P}/logout`);
    removeStorageValue(StorageKey.Token);
    return;
  },
  getIdentity: getUserSession,
  checkAuth: getUserSession,
  checkError: async ({ status }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem(StorageKey.Token);
      await axios.post(`${P}/logout`);
      throw new Error('Unauthorized');
    }
    return;
  },
  // Unused
  handleCallback: <T>() =>  Promise.resolve({} as T),
  getPermissions: <T>() =>  Promise.resolve({} as T),
};

export default authProvider;
