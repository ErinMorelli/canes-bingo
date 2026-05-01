import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { categories } from '@server/schema';

export const categoryBodySchema = createInsertSchema(categories, {
  name: (s) => s.min(1),
  label: (s) => s.min(1),
}).omit({ categoryId: true });

export type CategoryBody = z.infer<typeof categoryBodySchema>;
