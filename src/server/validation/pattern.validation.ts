import { z } from 'zod';

import { patternSquaresSchema } from '@schema/pattern.schema';

export const patternBodySchema = z.object({
  name: z.string().min(1),
  squares: z.string().transform((s, ctx) => {
    try {
      const parsed: unknown = JSON.parse(s);
      const result = patternSquaresSchema.safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: 'custom', message: 'Invalid squares format' });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'squares must be valid JSON' });
      return z.NEVER;
    }
  }),
});
