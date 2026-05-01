import { z } from 'zod';

import { gameOutputSchema } from '@schema/game.schema';
import { numericIdSchema } from '@schema/shared';

import {
  addGame,
  getGame,
  getGames,
  removeGame,
  updateGame,
} from '@server/controllers';
import { newGameSchema, updateGameSchema } from '@server/validation/game.validation';

import { publicFactory, authFactory } from './factories';

export const listGamesEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ items: z.array(gameOutputSchema) }),
  handler: async () => ({ items: await getGames() }),
});

export const getGameEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ gameId: numericIdSchema }),
  output: gameOutputSchema,
  handler: async ({ input: { gameId } }) => await getGame(gameId),
});

export const createGameEndpoint = authFactory.build({
  method: 'post',
  input: newGameSchema,
  output: gameOutputSchema,
  handler: async ({ input: { patterns, isDefault, ...rest } }) => {
    return await addGame({ ...rest, isDefault: isDefault ?? false }, patterns ?? []);
  },
});

export const updateGameEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ gameId: numericIdSchema }).merge(updateGameSchema),
  output: gameOutputSchema,
  handler: async ({ input: { gameId, patterns, isDefault, ...rest } }) => {
    return await updateGame(gameId, { ...rest, isDefault: isDefault ?? false }, {
      added: patterns?.added ?? [],
      removed: patterns?.removed ?? [],
    });
  },
});

export const deleteGameEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ gameId: numericIdSchema }),
  output: gameOutputSchema,
  handler: async ({ input: { gameId } }) => await removeGame(gameId),
});
