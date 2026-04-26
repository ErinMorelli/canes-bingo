import { z } from 'zod';

export const patternSquareSchema = z.object({
  col: z.number().int().min(0).max(4),
  row: z.number().int().min(0).max(4),
});

export const patternSquaresSchema = z.array(patternSquareSchema);

export const patternOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  squares: patternSquaresSchema,
});
