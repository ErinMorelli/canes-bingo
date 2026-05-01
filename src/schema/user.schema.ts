import { z } from 'zod';

export const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(256),
  password: z.string().min(1).max(1024),
});

export const userOutputSchema = z.object({
  id: z.number(),
  username: z.string(),
});
