import { z } from 'zod';

export const newSquareSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  categories: z.array(z.number().int().positive()).optional(),
});

export const updateSquareSchema = z.object({
  content: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  categories: z
    .object({
      added: z.array(z.number().int().positive()).optional(),
      removed: z.array(z.number().int().positive()).optional(),
    })
    .optional(),
});
