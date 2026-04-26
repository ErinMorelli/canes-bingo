import { z } from 'zod';

export const newSquareSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  categories: z.array(z.number()).optional(),
});

export const updateSquareSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  categories: z
    .object({
      added: z.array(z.number()).optional(),
      removed: z.array(z.number()).optional(),
    })
    .optional(),
});
