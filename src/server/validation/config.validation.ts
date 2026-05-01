import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { config } from '@server/schema';

export const configBodySchema = createInsertSchema(config, {
  key: (s) => s.min(1),
}).omit({ id: true });

export type ConfigBody = z.infer<typeof configBodySchema>;
