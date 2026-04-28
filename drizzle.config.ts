import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default defineConfig({
  schema: './src/server/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: { url: databaseUrl },
});
