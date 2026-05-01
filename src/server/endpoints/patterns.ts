import { z } from 'zod';

import { patternOutputSchema } from '@schema/pattern.schema';
import { numericIdSchema } from '@schema/shared';

import {
  addPattern,
  getPattern,
  getPatterns,
  removePattern,
  updatePattern,
} from '@server/controllers';
import { patternBodySchema } from '@server/validation/pattern.validation';

import { publicFactory, authFactory } from './factories';

export const listPatternsEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({}),
  output: z.object({ items: z.array(patternOutputSchema) }),
  handler: async () => ({ items: await getPatterns() }),
});

export const getPatternEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ patternId: numericIdSchema }),
  output: patternOutputSchema,
  handler: async ({ input: { patternId } }) => await getPattern(patternId),
});

export const createPatternEndpoint = authFactory.build({
  method: 'post',
  input: patternBodySchema,
  output: patternOutputSchema,
  handler: async ({ input: { name, squares } }) => await addPattern({ name, squares }),
});

export const updatePatternEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ patternId: numericIdSchema }).merge(patternBodySchema),
  output: patternOutputSchema,
  handler: async ({ input: { patternId, name, squares } }) => {
    return await updatePattern(patternId, { name, squares });
  },
});

export const deletePatternEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ patternId: numericIdSchema }),
  output: patternOutputSchema,
  handler: async ({ input: { patternId } }) => await removePattern(patternId),
});
