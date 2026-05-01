import { z } from 'zod';

export const patternSquareSchema = z.object({
  col: z.number().int().min(0).max(4),
  row: z.number().int().min(0).max(4),
});

export const patternSquaresSchema = z.array(patternSquareSchema).superRefine((squares, ctx) => {
  const seen = new Set<string>();
  for (const square of squares) {
    const key = `${square.row}:${square.col}`;
    if (seen.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pattern squares must be unique' });
      return;
    }
    seen.add(key);
  }
});

export const patternOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  squares: patternSquaresSchema,
});
