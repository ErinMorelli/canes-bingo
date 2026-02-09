import { sql } from 'kysely';

import { db } from '../database.ts';
import { GroupUpdate, NewGroup } from '../types.ts';

export async function getGroups() {
  return await db
    .selectFrom('groups as g')
    .leftJoin('categories as c', 'c.groupId', 'g.groupId')
    .select([
      'g.groupId as id',
      'g.name as name',
      'g.label as label',
      'g.description as description',
      sql<any>`
        if(count(c.category_id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.category_id,
            'name', c.name,
            'label', c.label,
            'description', c.description,
            'isDefault', if(c.is_default = true, cast(true as json), cast(false as json))
          )
        ))`.as('categories')
    ])
    .groupBy('g.groupId')
    .execute();
}

export async function getGroup(groupId: number, trx = db) {
  return await trx
    .selectFrom('groups as g')
    .select([
      'g.groupId as id',
      'g.name as name',
      'g.label as label',
      'g.description as description',
    ])
    .where('g.groupId', '=', groupId)
    .executeTakeFirstOrThrow();
}

export async function getGroupByName(groupName: string) {
  return await db
    .selectFrom('groups as g')
    .select([
      'g.groupId as id',
      'g.label as label',
      'g.description as description',
      sql<any>`
        if(count(c.category_id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.category_id,
            'name', c.name,
            'label', c.label,
            'description', c.description,
            'isDefault', if(c.is_default = true, cast(true as json), cast(false as json))
          )
        ))`.as('categories')
    ])
    .groupBy('g.groupId')
    .leftJoin('categories as c', 'c.groupId', 'g.groupId')
    .where('g.name', '=', groupName)
    .executeTakeFirstOrThrow();
}

export async function updateGroup(groupId: number, group: GroupUpdate) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('groups')
      .set(group)
      .where('groupId', '=', groupId)
      .execute();
    return await getGroup(groupId, trx);
  });
}

export async function addGroup(group: NewGroup) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx.insertInto('groups')
      .values(group)
      .executeTakeFirstOrThrow();
    const groupId = Number(result.insertId);
    return await getGroup(groupId, trx);
  });
}

export async function removeGroup(groupId: number) {
  return await db.transaction().execute(async (trx) => {
    const group = await getGroup(groupId, trx);
    await trx
      .deleteFrom('groups')
      .where('groupId', '=', groupId)
      .execute();
    return group;
  });
}
