import { z } from 'zod';

export const configOutputSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
});
