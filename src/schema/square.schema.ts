import { z } from 'zod';

export const squareOutputSchema = z.object({
  id: z.number(),
  value: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  categories: z.string().nullable(),
});
