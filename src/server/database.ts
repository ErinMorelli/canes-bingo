import path from 'path';
import dotenv from 'dotenv';
import { ConnectionOptions, createPool } from 'mysql2';
import { CamelCasePlugin, Kysely, MysqlDialect, MysqlPool } from 'kysely';

import { Database as DB } from './types';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
  });
}

export const dbConfig: ConnectionOptions = {
  uri: process.env.DATABASE_URL
};

const dialect = new MysqlDialect({
  pool: createPool(dbConfig) as MysqlPool,
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
