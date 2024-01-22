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
      sql<string>`
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.category_id,
            'name', c.name,
            'label', c.label,
            'isDefault', if(c.is_default = true, cast(true as json), cast(false as json))
          )
        )`.as('categories')
    ])
    .groupBy('g.groupId')
    .execute();
}

export async function getGroup(groupId: number) {
  return await db
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
      sql<string>`
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', c.category_id,
            'name', c.name,
            'label', c.label,
            'isDefault', if(c.is_default = true, cast(true as json), cast(false as json))
          )
        )`.as('categories')
    ])
    .groupBy('g.groupId')
    .leftJoin('categories as c', 'c.groupId', 'g.groupId')
    .where('g.name', '=', groupName)
    .executeTakeFirstOrThrow();
}

export async function updateGroup(groupId: number, group: GroupUpdate) {
  return await db
    .updateTable('groups')
    .set(group)
    .where('groupId', '=', groupId)
    .executeTakeFirstOrThrow()
    .then(() => getGroup(groupId));
}

export async function addGroup(group: NewGroup) {
  return await db
    .insertInto('groups')
    .values(group)
    .executeTakeFirstOrThrow()
    .then((result) => getGroup(Number(result.insertId)));
}

export async function removeGroup(groupId: number) {
  const group = await getGroup(groupId);
  return await db
    .deleteFrom('groups')
    .where('groupId', '=', groupId)
    .executeTakeFirstOrThrow()
    .then(() => group);
}
