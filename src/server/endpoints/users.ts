import { z } from 'zod';

import { userOutputSchema } from '@schema/user.schema';
import { numericIdSchema } from '@schema/shared';

import {
  addUser,
  getUser,
  getUsers,
  removeUser,
  updateUser,
} from '@server/controllers';
import { newUserSchema, updateUserSchema } from '@server/validation/user.validation';

import { authFactory } from './factories';

export const listUsersEndpoint = authFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ items: z.array(userOutputSchema) }),
  handler: async () => ({ items: await getUsers() }),
});

export const getUserEndpoint = authFactory.build({
  method: 'get',
  input: z.object({ userId: numericIdSchema }),
  output: userOutputSchema,
  handler: async ({ input: { userId } }) => await getUser(userId),
});

export const createUserEndpoint = authFactory.build({
  method: 'post',
  input: newUserSchema,
  output: userOutputSchema,
  handler: async ({ input: { username, password } }) => {
    return await addUser({ username, password });
  },
});

export const updateUserEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ userId: numericIdSchema }).merge(updateUserSchema),
  output: userOutputSchema,
  handler: async ({ input: { userId, username, password } }) => {
    return await updateUser(userId, { username, password });
  },
});

export const deleteUserEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ userId: numericIdSchema }),
  output: userOutputSchema,
  handler: async ({ input: { userId } }) => await removeUser(userId),
});
