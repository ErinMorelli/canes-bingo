export const Api = {
  auth: {
    session:  'get /api/v1/session',
    login:    'post /api/v1/login',
    logout:   'post /api/v1/logout',
  },
  config: {
    list:   'get /api/v1/config',
    get:    'get /api/v1/config/:configId',
    update: 'put /api/v1/config/:configId',
  },
  categories: {
    list:   'get /api/v1/categories',
    create: 'post /api/v1/categories',
    update: 'put /api/v1/categories/:categoryId',
    delete: 'delete /api/v1/categories/:categoryId',
  },
  groups: {
    list:   'get /api/v1/groups',
    create: 'post /api/v1/groups',
    update: 'put /api/v1/groups/:groupId',
    delete: 'delete /api/v1/groups/:groupId',
  },
  games: {
    list:   'get /api/v1/games',
    create: 'post /api/v1/games',
    update: 'put /api/v1/games/:gameId',
    delete: 'delete /api/v1/games/:gameId',
  },
  patterns: {
    list:   'get /api/v1/patterns',
    create: 'post /api/v1/patterns',
    update: 'put /api/v1/patterns/:patternId',
    delete: 'delete /api/v1/patterns/:patternId',
  },
  squares: {
    list:   'get /api/v1/squares',
    create: 'post /api/v1/squares',
    update: 'put /api/v1/squares/:squareId',
    delete: 'delete /api/v1/squares/:squareId',
  },
  users: {
    list:   'get /api/v1/users',
    create: 'post /api/v1/users',
    delete: 'delete /api/v1/users/:userId',
  },
} as const;
