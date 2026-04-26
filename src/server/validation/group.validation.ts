import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { groups } from '@server/schema';

export const groupBodySchema = createInsertSchema(groups, {
  name: (s) => s.min(1),
  label: (s) => s.min(1),
}).omit({ groupId: true });

export type GroupBody = z.infer<typeof groupBodySchema>;
