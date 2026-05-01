import createHttpError from 'http-errors';
import { z } from 'zod';

import { credentialsSchema } from '@schema/user.schema';
import { regenerateSession, saveSession } from '@schema/shared';

import { authenticateUser } from '@server/controllers';

import { publicFactory, authFactory } from './factories';

export const loginEndpoint = publicFactory.build({
  method: 'post',
  input: credentialsSchema,
  output: z.object({ userId: z.number(), username: z.string() }),
  handler: async ({ input: { username, password }, ctx: { request } }) => {
    const user = await authenticateUser({ username, password });
    if (!user) throw createHttpError(401, 'Invalid credentials');
    const { userId, username: name } = user;
    await regenerateSession(request);
    request.session.user = { userId, username: name };
    await saveSession(request);
    return { userId, username: name };
  },
});

export const logoutEndpoint = authFactory.build({
  method: 'post',
  input: z.object({}),
  output: z.object({}),
  handler: async ({ ctx: { request } }) => {
    request.session.user = undefined;
    await regenerateSession(request);
    return {};
  },
});

export const sessionEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({
    userId: z.number(),
    username: z.string(),
  }),
  handler: async ({ ctx: { request } }) => {
    const user = request.session.user;
    if (!user) throw createHttpError(401, 'Not authenticated');
    return user;
  },
});

