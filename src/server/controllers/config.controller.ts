import { db } from '../database.ts';
import { ConfigUpdate, NewConfig } from '../types.ts';

export async function getConfig() {
  return db
    .selectFrom('config')
    .selectAll()
    .execute();
}

export async function getConfigValue(id: number) {
  return await db
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
  return await db
    .updateTable('config')
    .set(config)
    .where('id', '=', id)
    .execute()
    .then(() => getConfigValue(id));
}

export async function addConfig(config: NewConfig) {
  return await db
    .insertInto('config')
    .values(config)
    .executeTakeFirstOrThrow()
    .then((result) => getConfigValue(Number(result.insertId!)));
}

export async function removeConfig(id: number) {
  const config = await getConfigValue(id);
  return await db
    .deleteFrom('config')
    .where('id', '=', id)
    .execute()
    .then(() => config);
}
