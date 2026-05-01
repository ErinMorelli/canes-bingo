import { z } from 'zod';

export const newGameSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  patterns: z.array(z.number()).optional(),
});

export const updateGameSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  patterns: z
    .object({
      added: z.array(z.number()).optional(),
      removed: z.array(z.number()).optional(),
    })
    .optional(),
});
