import { z } from 'zod';

import { categoryOutputSchema } from '@schema/category.schema';
import { numericIdSchema, optionalNumericIdSchema } from '@schema/shared';

import {
  addCategory,
  getCategories,
  getCategory,
  removeCategory,
  updateCategory,
} from '@server/controllers';
import { categoryBodySchema } from '@server/validation/category.validation';

import { publicFactory, authFactory } from './factories';

export const listCategoriesEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({
    group_id: optionalNumericIdSchema,
  }),
  output: z.object({ items: z.array(categoryOutputSchema) }),
  handler: async ({ input: { group_id } }) => {
    return { items: await getCategories(group_id) };
  },
});

export const getCategoryEndpoint = publicFactory.build({
  method: 'get',
  input: z.object({ categoryId: numericIdSchema }),
  output: categoryOutputSchema,
  handler: async ({ input: { categoryId } }) => await getCategory(categoryId),
});

export const createCategoryEndpoint = authFactory.build({
  method: 'post',
  input: categoryBodySchema,
  output: categoryOutputSchema,
  handler: async ({ input }) => await addCategory({
    name: input.name,
    label: input.label,
    description: input.description ?? '',
    groupId: input.groupId ?? null,
    isDefault: input.isDefault ?? false,
  }),
});

export const updateCategoryEndpoint = authFactory.build({
  method: 'put',
  input: z.object({ categoryId: numericIdSchema }).merge(categoryBodySchema),
  output: categoryOutputSchema,
  handler: async ({ input: { categoryId, description, groupId, isDefault, ...rest } }) => {
    return await updateCategory(categoryId, {
      ...rest,
      description,
      groupId,
      isDefault,
    });
  },
});

export const deleteCategoryEndpoint = authFactory.build({
  method: 'delete',
  input: z.object({ categoryId: numericIdSchema }),
  output: categoryOutputSchema,
  handler: async ({ input: { categoryId } }) => await removeCategory(categoryId),
});
