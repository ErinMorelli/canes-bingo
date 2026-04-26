import { eq, sql } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { categories, squareCategories } from '@server/schema';
import type { NewCategory } from '@server/schema';

const categorySelect = {
  id: categories.categoryId,
  name: categories.name,
  label: categories.label,
  description: categories.description,
  isDefault: sql<boolean>`if(${categories.isDefault} = true, cast(true as json), cast(false as json))`,
  groupId: categories.groupId,
};

export async function getCategories(groupId?: number) {
  const query = db.select(categorySelect).from(categories);
  return groupId ? query.where(eq(categories.groupId, groupId)) : query;
}

export async function getCategory(categoryId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await trx
    .select(categorySelect)
    .from(categories)
    .where(eq(categories.categoryId, categoryId))
    .limit(1);
  if (!result) throw createHttpError(404, 'Category not found');
  return result;
}

export async function addCategory(category: NewCategory) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(categories).values(category);
    const categoryId = Number(result[0].insertId);
    return await getCategory(categoryId, trx);
  }).catch(handleDbError);
}

export async function updateCategory(categoryId: number, category: Partial<NewCategory>) {
  return await db.transaction(async (trx) => {
    await trx.update(categories).set(category).where(eq(categories.categoryId, categoryId));
    return await getCategory(categoryId, trx);
  }).catch(handleDbError);
}

export async function removeCategory(categoryId: number) {
  return await db.transaction(async (trx) => {
    const category = await getCategory(categoryId, trx);
    await trx.delete(squareCategories).where(eq(squareCategories.categoryId, categoryId));
    await trx.delete(categories).where(eq(categories.categoryId, categoryId));
    return category;
  });
}
