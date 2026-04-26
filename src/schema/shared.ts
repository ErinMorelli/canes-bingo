import type { Request } from 'express';
import { z } from 'zod';

export const numericIdSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a numeric ID')
  .transform(s => parseInt(s, 10));

export const optionalNumericIdSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a numeric ID')
  .transform(s => parseInt(s, 10))
  .optional();

export const regenerateSession = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.regenerate(err => (err ? reject(err) : resolve()))
  );

export const saveSession = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.save(err => (err ? reject(err) : resolve()))
  );
