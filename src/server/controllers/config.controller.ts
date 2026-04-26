import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { config } from '@server/schema';
import type { NewConfig } from '@server/schema';

export async function getConfig() {
  return db.select().from(config).execute();
}

async function getConfigValue(id: number, trx: typeof db | DbTransaction = db) {
  const [result] = await trx.select().from(config).where(eq(config.id, id)).limit(1);
  if (!result) throw createHttpError(404, 'Config not found');
  return result;
}

export async function getConfigValueByKey(key: string, trx: typeof db | DbTransaction = db) {
  const [result] = await trx.select().from(config).where(eq(config.key, key)).limit(1);
  if (!result) throw createHttpError(404, 'Config key not found');
  return result;
}

export async function updateConfigByKey(key: string, data: Partial<NewConfig>) {
  return await db.transaction(async (trx) => {
    await trx.update(config).set(data).where(eq(config.key, key));
    return await getConfigValueByKey(key, trx);
  }).catch(handleDbError);
}

export async function removeConfigByKey(key: string) {
  return await db.transaction(async (trx) => {
    const row = await getConfigValueByKey(key, trx);
    await trx.delete(config).where(eq(config.key, key));
    return row;
  });
}

export async function addConfig(data: NewConfig) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(config).values(data);
    const configId = Number(result[0].insertId);
    return await getConfigValue(configId, trx);
  }).catch(handleDbError);
}

