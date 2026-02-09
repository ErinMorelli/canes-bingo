import { db } from '../database.ts';
import { ConfigUpdate, NewConfig } from '../types.ts';

export async function getConfig() {
  return db
    .selectFrom('config')
    .selectAll()
    .execute();
}

export async function getConfigValue(id: number, trx = db) {
  return await trx
    .selectFrom('config')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
}

export async function getConfigValueByKey(key: string) {
  return await db
    .selectFrom('config')
    .selectAll()
    .where('key', '=', key)
    .executeTakeFirstOrThrow();
}

export async function updateConfig(id: number, config: ConfigUpdate) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('config')
      .set(config)
      .where('id', '=', id)
      .execute();
    return await getConfigValue(id, trx);
  });
}

export async function addConfig(config: NewConfig) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto('config')
      .values(config)
      .executeTakeFirstOrThrow();
    const configId = Number(result.insertId);
    return await getConfigValue(configId, trx);
  });
}

export async function removeConfig(id: number) {
  return await db.transaction().execute(async (trx) => {
    const config = await getConfigValue(id, trx);
    await trx
      .deleteFrom('config')
      .where('id', '=', id)
      .execute();
    return config;
  });
}
