import { z } from 'zod';

import { groupOutputSchema } from '@schema/group.schema';
import { numericIdSchema } from '@schema/shared';

import {
  addGroup,
  getGroupById,
  getGroups,
  removeGroup,
  updateGroup,
} from '@server/controllers';
import { groupBodySchema } from '@server/validation/group.validation';

import { publicFactory, authFactory } from './factories';

export const listGroupsEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ items: z.array(groupOutputSchema) }),
  handler: async () => ({ items: await getGroups() }),
});

export const getGroupEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ groupId: numericIdSchema }),
  output: groupOutputSchema,
  handler: async ({ input: { groupId } }) => await getGroupById(groupId),
});

export const createGroupEndpoint = authFactory.build({
  method: 'post',
  input: groupBodySchema,
  output: groupOutputSchema,
  handler: async ({ input: { name, label, description } }) => {
    return await addGroup({ name, label, description: description ?? '' });
  },
});

export const updateGroupEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ groupId: numericIdSchema }).merge(groupBodySchema),
  output: groupOutputSchema,
  handler: async ({ input: { groupId, name, label, description } }) => {
    return await updateGroup(groupId, { name, label, description });
  },
});

export const deleteGroupEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ groupId: numericIdSchema }),
  output: groupOutputSchema,
  handler: async ({ input: { groupId } }) => await removeGroup(groupId),
});
