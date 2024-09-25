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
      sql<string>`
        if(c.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      `c.groupId as groupId`,
    ]);

  if (groupId) {
    query = query.where('c.groupId', '=', groupId);
  }

  return await query.execute();
}

export async function getCategory(categoryId: number) {
  return await db
    .selectFrom('categories as c')
    .select([
      'c.categoryId as id',
      'c.name as name',
      'c.label as label',
      'c.description as description',
      sql<string>`
        if(c.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      `c.groupId as groupId`,
    ])
    .where('c.categoryId', '=', categoryId)
    .executeTakeFirstOrThrow();
}

export async function addCategory(category: NewCategory) {
  return await db
    .insertInto('categories')
    .values(category)
    .executeTakeFirstOrThrow()
    .then((result) => getCategory(Number(result.insertId!)));
}

export async function updateCategory(categoryId: number, category: CategoryUpdate) {
  return await db
    .updateTable('categories')
    .set(category)
    .where('categoryId', '=', categoryId)
    .executeTakeFirstOrThrow()
    .then(() => getCategory(categoryId));
}

export async function removeCategory(categoryId: number) {
  const category = await getCategory(categoryId);
  return await db
    .deleteFrom('squareCategories')
    .where('categoryId', '=', categoryId)
    .executeTakeFirstOrThrow()
    .then(async () => await db
      .deleteFrom('categories')
      .where('categoryId', '=', categoryId)
      .executeTakeFirstOrThrow()
    ).then(() => category);
}
