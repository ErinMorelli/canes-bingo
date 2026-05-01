import { and, eq, inArray, or, sql } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { categories, squareCategories, squares } from '@server/schema';
import type { NewSquare, NewSquareCategory } from '@server/schema';

function squaresBaseQuery(by: 'id' | 'name', trx: typeof db | DbTransaction = db) {
  const catColumn = by === 'id' ? categories.categoryId : categories.name;
  const cats = trx.$with('cats').as(
    trx
      .select({ squareId: squareCategories.squareId, cat: catColumn })
      .from(categories)
      .leftJoin(squareCategories, eq(squareCategories.categoryId, categories.categoryId)),
  );
  return trx
    .with(cats)
    .select({
      id: squares.squareId,
      value: squares.content,
      description: squares.description,
      // MySQL2 returns TINYINT(1) booleans as 0/1; the IF/CAST normalises to JSON true/false.
      active: sql<boolean>`if(${squares.active} = true, cast(true as json), cast(false as json))`.as('active'),
      categories: sql<string | null>`group_concat(${cats.cat})`.as('categories'),
    })
    .from(squares)
    .leftJoin(cats, eq(cats.squareId, squares.squareId))
    .groupBy(squares.squareId);
}

export async function getSquares(
  include?: string[],
  exclude?: string[],
  categoryId?: number,
) {
  if (!include && !exclude) {
    const query = squaresBaseQuery('id');
    if (categoryId) {
      // Filter at the square level (not the CTE) so group_concat still returns
      // all categories for each matched square, not just the filtered one.
      return query.where(
        inArray(
          squares.squareId,
          db.select({ squareId: squareCategories.squareId })
            .from(squareCategories)
            .where(eq(squareCategories.categoryId, categoryId)),
        ),
      ).execute();
    }
    return query.execute();
  }

  // Use a name-based subquery only for filtering; the outer query uses the
  // ID-backed shape so `categories` always contains numeric IDs in the output.
  const filterSub = squaresBaseQuery('name').as('filter');
  const includeCondition = include
    ? or(...include.map((i) => sql<boolean>`FIND_IN_SET(${i}, ${filterSub.categories})`))
    : undefined;
  const excludeConditions = exclude
    ? exclude.map((e) => sql<boolean>`NOT FIND_IN_SET(${e}, COALESCE(${filterSub.categories}, ''))`)
    : [];

  const filteredIds = db
    .select({ squareId: filterSub.id })
    .from(filterSub)
    .where(and(includeCondition, ...excludeConditions));

  return squaresBaseQuery('id')
    .where(inArray(squares.squareId, filteredIds))
    .execute();
}

export async function getSquare(squareId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await squaresBaseQuery('id', trx).where(eq(squares.squareId, squareId)).limit(1);
  if (!result) throw createHttpError(404, 'Square not found');
  return result;
}

export async function addSquare(square: NewSquare, categoryIds: number[]) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(squares).values(square);
    const squareId = Number(result[0].insertId);
    if (categoryIds.length > 0) {
      await trx.insert(squareCategories).values(
        categoryIds.map((categoryId): NewSquareCategory => ({ categoryId, squareId })),
      );
    }
    return await getSquare(squareId, trx);
  }).catch(handleDbError);
}

export async function updateSquare(
  squareId: number,
  square: Partial<NewSquare>,
  categoryUpdates: { added: number[]; removed: number[] },
) {
  return await db.transaction(async (trx) => {
    if (Object.keys(square).length > 0) {
      await trx.update(squares).set(square).where(eq(squares.squareId, squareId));
    }
    if (categoryUpdates.added.length > 0) {
      const existing = await trx
        .select({ categoryId: squareCategories.categoryId })
        .from(squareCategories)
        .where(and(
          eq(squareCategories.squareId, squareId),
          inArray(squareCategories.categoryId, categoryUpdates.added),
        ));
      const existingIds = new Set(existing.map((r) => r.categoryId));
      const toAdd = categoryUpdates.added.filter((id) => !existingIds.has(id));
      if (toAdd.length > 0) {
        await trx.insert(squareCategories).values(
          toAdd.map((categoryId): NewSquareCategory => ({ categoryId, squareId })),
        );
      }
    }
    if (categoryUpdates.removed.length > 0) {
      await trx.delete(squareCategories).where(
        and(
          eq(squareCategories.squareId, squareId),
          inArray(squareCategories.categoryId, categoryUpdates.removed),
        ),
      );
    }
    return await getSquare(squareId, trx);
  }).catch(handleDbError);
}

export async function removeSquare(squareId: number) {
  return await db.transaction(async (trx) => {
    const square = await getSquare(squareId, trx);
    await trx.delete(squares).where(eq(squares.squareId, squareId));
    return square;
  }).catch(handleDbError);
}
