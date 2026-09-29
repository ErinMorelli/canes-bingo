import { z } from 'zod';

import { categoryOutputSchema } from '@schema/category.schema';
import { gameOutputSchema } from '@schema/game.schema';
import { groupOutputSchema } from '@schema/group.schema';
import { patternOutputSchema } from '@schema/pattern.schema';
import { squareOutputSchema } from '@schema/square.schema';
import { userOutputSchema } from '@schema/user.schema';

export type AdminCategory = z.infer<typeof categoryOutputSchema>;
export type AdminGroup    = z.infer<typeof groupOutputSchema>;
export type AdminSquare   = z.infer<typeof squareOutputSchema>;
export type AdminGame     = z.infer<typeof gameOutputSchema>;
export type AdminPattern  = z.infer<typeof patternOutputSchema>;
export type AdminUser     = z.infer<typeof userOutputSchema>;

// Admin-specific derived shapes
export type AdminGameRow      = Omit<AdminGame, 'patterns'> & { patternIds: number[] };
export type AdminSquareWithCats = AdminSquare & { categoryIds: number[] };
