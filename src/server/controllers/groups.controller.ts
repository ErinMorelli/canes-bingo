import { eq, sql } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { categories, groups } from '@server/schema';
import type { NewGroup } from '@server/schema';

type GroupCategory = { id: number; name: string; label: string; description: string | null; isDefault: boolean };

function groupsBaseQuery(trx: typeof db | DbTransaction = db) {
  return trx
    .select({
      id: groups.groupId,
      name: groups.name,
      label: groups.label,
      description: groups.description,
      categories: sql<GroupCategory[]>`
        if(count(${categories.categoryId}) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ${categories.categoryId},
            'name', ${categories.name},
            'label', ${categories.label},
            'description', ${categories.description},
            'isDefault', if(${categories.isDefault} = true, cast(true as json), cast(false as json))
          )
        ))`,
    })
    .from(groups)
    .leftJoin(categories, eq(categories.groupId, groups.groupId))
    .groupBy(groups.groupId);
}

export async function getGroups() {
  return groupsBaseQuery().execute();
}

export async function getGroupById(groupId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await groupsBaseQuery(trx).where(eq(groups.groupId, groupId)).limit(1);
  if (!result) throw createHttpError(404, 'Group not found');
  return result;
}

async function getGroup(groupId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await trx
    .select({ id: groups.groupId, name: groups.name, label: groups.label, description: groups.description })
    .from(groups)
    .where(eq(groups.groupId, groupId))
    .limit(1);
  if (!result) throw createHttpError(404, 'Group not found');
  return result;
}

export async function updateGroup(groupId: number, group: Partial<NewGroup>) {
  return await db.transaction(async (trx) => {
    await trx.update(groups).set(group).where(eq(groups.groupId, groupId));
    return await getGroupById(groupId, trx);
  }).catch(handleDbError);
}

export async function addGroup(group: NewGroup) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(groups).values(group);
    const groupId = Number(result[0].insertId);
    return await getGroup(groupId, trx);
  }).catch(handleDbError);
}

export async function removeGroup(groupId: number) {
  return await db.transaction(async (trx) => {
    const group = await getGroup(groupId, trx);
    await trx.update(categories).set({ groupId: null }).where(eq(categories.groupId, groupId));
    await trx.delete(groups).where(eq(groups.groupId, groupId));
    return group;
  });
}
