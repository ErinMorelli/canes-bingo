import { z } from 'zod';

export const groupCategoryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
});

export const groupOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  categories: z.array(groupCategoryItemSchema).optional(),
});
