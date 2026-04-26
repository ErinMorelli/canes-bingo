import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { users } from '@server/schema';

export const newUserSchema = createInsertSchema(users).omit({ userId: true });

export const updateUserSchema = z.object({
  username: z.string(),
  password: z.string().optional(),
});
