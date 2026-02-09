import { sql } from 'kysely';

import { db } from '../database.ts';
import { CategoryUpdate, NewCategory } from '../types.ts';

export async function getCategories(groupId?: number) {
  let query = db
    .selectFrom('categories as c')
    .select([
      'c.categoryId as id',
      'c.name as name',
      'c.label as label',
      'c.description as description',
      sql<boolean>`
        if(c.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      `c.groupId as groupId`,
    ]);

  if (groupId) {
    query = query.where('c.groupId', '=', groupId);
  }

  return await query.execute();
}

export async function getCategory(categoryId: number, trx = db) {
  return await trx
    .selectFrom('categories as c')
    .select([
      'c.categoryId as id',
      'c.name as name',
      'c.label as label',
      'c.description as description',
      sql<boolean>`
        if(c.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      `c.groupId as groupId`,
    ])
    .where('c.categoryId', '=', categoryId)
    .executeTakeFirstOrThrow();
}

export async function addCategory(category: NewCategory) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto('categories')
      .values(category)
      .executeTakeFirstOrThrow();
    const categoryId = Number(result.insertId);
    return await getCategory(categoryId, trx);
  });
}

export async function updateCategory(categoryId: number, category: CategoryUpdate) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('categories')
      .set(category)
      .where('categoryId', '=', categoryId)
      .execute();
    return await getCategory(categoryId, trx);
  });
}

export async function removeCategory(categoryId: number) {
  return await db.transaction().execute(async (trx) => {
    const category = await getCategory(categoryId, trx);
    await trx
      .deleteFrom('squareCategories')
      .where('categoryId', '=', categoryId)
      .execute();
    await trx
      .deleteFrom('categories')
      .where('categoryId', '=', categoryId)
      .execute();
    return category;
  });
}
