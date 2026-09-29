import path from 'node:path';
import dotenv from 'dotenv';
import { createPool } from 'mysql2';
import type { ConnectionOptions } from 'mysql2';
import { drizzle } from 'drizzle-orm/mysql2';

import * as schema from './schema';

if (process.env.NODE_ENV !== 'production') {
  /*
    Both files, `.env.local` first so it wins where they overlap — dotenv
    keeps the first value it sees for a key. That is the usual split: `.env`
    committed-ish defaults, `.env.local` the machine's own overrides.

    Previously this read `.env.local` alone, which meant consolidating the
    values into `.env` left the server with no DATABASE_URL and no SECRET_KEY
    the next time it restarted. Reading both makes the layout a choice rather
    than a requirement.
  */
  dotenv.config({
    path: [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), '.env'),
    ],
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
