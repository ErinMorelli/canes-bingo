import { z } from 'zod';

import { patternSquareSchema } from './pattern.schema';

export const gameOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  patterns: z.array(z.object({
    id: z.number(),
    name: z.string(),
    squares: z.array(patternSquareSchema),
  })),
});
