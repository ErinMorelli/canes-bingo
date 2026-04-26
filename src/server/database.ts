import path from 'node:path';
import dotenv from 'dotenv';
import { createPool } from 'mysql2';
import type { ConnectionOptions } from 'mysql2';
import { drizzle } from 'drizzle-orm/mysql2';

import * as schema from './schema';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const dbConfig: ConnectionOptions = {
  uri: DATABASE_URL,
};

export const db = drizzle({ client: createPool(dbConfig), schema, mode: 'default' });

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
