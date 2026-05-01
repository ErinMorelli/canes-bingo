import { Routing } from 'express-zod-api';

import { loginEndpoint, logoutEndpoint, sessionEndpoint } from './endpoints/auth';
import { listGroupsEndpoint, getGroupEndpoint, createGroupEndpoint, updateGroupEndpoint, deleteGroupEndpoint } from './endpoints/groups';
import { listUsersEndpoint, getUserEndpoint, createUserEndpoint, updateUserEndpoint, deleteUserEndpoint } from './endpoints/users';
import { listCategoriesEndpoint, getCategoryEndpoint, createCategoryEndpoint, updateCategoryEndpoint, deleteCategoryEndpoint } from './endpoints/categories';
import { listConfigEndpoint, getConfigEndpoint, createConfigEndpoint, updateConfigEndpoint, deleteConfigEndpoint } from './endpoints/config';
import { listPatternsEndpoint, getPatternEndpoint, createPatternEndpoint, updatePatternEndpoint, deletePatternEndpoint } from './endpoints/patterns';
import { listGamesEndpoint, getGameEndpoint, createGameEndpoint, updateGameEndpoint, deleteGameEndpoint } from './endpoints/games';
import { listSquaresEndpoint, getSquareEndpoint, createSquareEndpoint, updateSquareEndpoint, deleteSquareEndpoint } from './endpoints/squares';

export const routing: Routing = {
  api: {
    v1: {
      login: { post: loginEndpoint },
      logout: { post: logoutEndpoint },
      session: { get: sessionEndpoint },
      users: {
        get: listUsersEndpoint,
        post: createUserEndpoint,
        ':userId': {
          get: getUserEndpoint,
          put: updateUserEndpoint,
          delete: deleteUserEndpoint,
        },
      },
      games: {
        get: listGamesEndpoint,
        post: createGameEndpoint,
        ':gameId': {
          get: getGameEndpoint,
          put: updateGameEndpoint,
          delete: deleteGameEndpoint,
        },
      },
      groups: {
        get: listGroupsEndpoint,
        post: createGroupEndpoint,
        ':groupId': {
          get: getGroupEndpoint,
          put: updateGroupEndpoint,
          delete: deleteGroupEndpoint,
        },
      },
      categories: {
        get: listCategoriesEndpoint,
        post: createCategoryEndpoint,
        ':categoryId': {
          get: getCategoryEndpoint,
          put: updateCategoryEndpoint,
          delete: deleteCategoryEndpoint,
        },
      },
      patterns: {
        get: listPatternsEndpoint,
        post: createPatternEndpoint,
        ':patternId': {
          get: getPatternEndpoint,
          put: updatePatternEndpoint,
          delete: deletePatternEndpoint,
        },
      },
      squares: {
        get: listSquaresEndpoint,
        post: createSquareEndpoint,
        ':squareId': {
          get: getSquareEndpoint,
          put: updateSquareEndpoint,
          delete: deleteSquareEndpoint,
        },
      },
      config: {
        get: listConfigEndpoint,
        post: createConfigEndpoint,
        ':configId': {
          get: getConfigEndpoint,
          put: updateConfigEndpoint,
          delete: deleteConfigEndpoint,
        },
      },
    },
  },
};
