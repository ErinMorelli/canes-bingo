import { z } from 'zod';

import { squareOutputSchema } from '@schema/square.schema';
import { numericIdSchema, optionalNumericIdSchema } from '@schema/shared';

import {
  addSquare,
  getSquare,
  getSquares,
  removeSquare,
  updateSquare,
} from '@server/controllers';
import { newSquareSchema, updateSquareSchema } from '@server/validation/square.validation';

import { publicFactory, authFactory } from './factories';

export const listSquaresEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({
    exclude: z.string().optional(),
    include: z.string().optional(),
    category_id: optionalNumericIdSchema,
  }),
  output: z.object({ items: z.array(squareOutputSchema) }),
  handler: async ({ input: { exclude, include, category_id } }) => {
    const excludes = exclude ? exclude.split(',').map(x => x.trim()) : undefined;
    const includes = include ? include.split(',').map(x => x.trim()) : undefined;
    return { items: await getSquares(includes, excludes, category_id) };
  },
});

export const getSquareEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ squareId: numericIdSchema }),
  output: squareOutputSchema,
  handler: async ({ input: { squareId } }) => await getSquare(squareId),
});

export const createSquareEndpoint = authFactory.build({
  method: 'post',
  input: newSquareSchema,
  output: squareOutputSchema,
  handler: async ({ input: { categories, active, description, ...rest } }) => {
    return await addSquare(
      { ...rest, description: description ?? '', active: active ?? true },
      categories ?? []
    );
  },
});

export const updateSquareEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ squareId: numericIdSchema }).merge(updateSquareSchema),
  output: squareOutputSchema,
  handler: async ({ input: { squareId, categories, ...square } }) => {
    return await updateSquare(squareId, square, {
      added: categories?.added ?? [],
      removed: categories?.removed ?? [],
    });
  },
});

export const deleteSquareEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ squareId: numericIdSchema }),
  output: squareOutputSchema,
  handler: async ({ input: { squareId } }) => await removeSquare(squareId),
});
