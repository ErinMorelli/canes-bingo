import { z } from 'zod';

export const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const userOutputSchema = z.object({
  id: z.number(),
  username: z.string(),
});
