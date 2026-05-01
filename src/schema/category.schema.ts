import { z } from 'zod';

export const categoryOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  groupId: z.number().nullable(),
});
