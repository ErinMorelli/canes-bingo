import { z } from 'zod';

import { configOutputSchema } from '@schema/config.schema';

import { configBodySchema } from '@server/validation/config.validation';
import {
  addConfig,
  getConfig,
  getConfigValueByKey,
  removeConfigByKey,
  updateConfigByKey,
} from '@server/controllers';

import { publicFactory, authFactory } from './factories';

export const listConfigEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ items: z.array(configOutputSchema) }),
  handler: async () => ({ items: await getConfig() }),
});

export const getConfigEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ configId: z.string().min(1) }),
  output: configOutputSchema,
  handler: async ({ input: { configId } }) => await getConfigValueByKey(configId),
});

export const createConfigEndpoint = authFactory.build({
  method: 'post',
  input: configBodySchema,
  output: configOutputSchema,
  handler: async ({ input }) => await addConfig(input),
});

export const updateConfigEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ configId: z.string().min(1) }).merge(configBodySchema),
  output: configOutputSchema,
  handler: async ({ input: { configId, ...body } }) => await updateConfigByKey(configId, body),
});

export const deleteConfigEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ configId: z.string().min(1) }),
  output: configOutputSchema,
  handler: async ({ input: { configId } }) => await removeConfigByKey(configId),
});
