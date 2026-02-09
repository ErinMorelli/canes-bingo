import { sql } from 'kysely';

import { db } from '../database.ts';
import { NewSquare, SquareUpdate } from '../types.ts';

export async function getSquares(
  include?: Array<string>,
  exclude?: Array<string>,
  categoryId?: number,
) {
  if (!include && !exclude) {
    let query = db
      .with('cats', (_db) => _db
        .selectFrom('categories as c')
        .leftJoin('squareCategories as sc', 'sc.categoryId', 'c.categoryId')
        .select(['sc.squareId', 'c.categoryId'])
      )
      .selectFrom('squares as s')
      .leftJoin('cats', 'cats.squareId', 's.squareId')
      .select([
        's.squareId as id',
        's.content as value',
        's.description as description',
        sql<boolean>`
         if(s.active = true, cast(true as json), cast(false as json))
        `.as('active'),
        ({ fn }) => fn
          .agg('group_concat', ['cats.categoryId'])
          .as('categories')
      ])
      .groupBy('s.squareId');

    if (categoryId) {
      query = query.where('cats.categoryId', '=', categoryId);
    }

    return await query.execute();
  }

  const baseQuery = db
    .with('cats', (_db) => _db
      .selectFrom('categories as c')
      .leftJoin('squareCategories as sc', 'sc.categoryId', 'c.categoryId')
      .select(['sc.squareId', 'c.name'])
    )
    .selectFrom('squares as s')
    .leftJoin('cats', 'cats.squareId', 's.squareId')
    .select([
      's.squareId as id',
      's.content as value',
      's.description as description',
      sql<boolean>`
         if(s.active = true, cast(true as json), cast(false as json))
      `.as('active'),
      ({ fn }) => fn
        .agg('group_concat', ['cats.name'])
        .as('categories')
    ])
    .groupBy('s.squareId');

  const includeQuery = db
    .selectFrom(baseQuery.as('a'))
    .selectAll()
    .where((eb) =>
      eb.or(include!.map((i) =>
        sql<boolean>`FIND_IN_SET(${i}, ${eb.ref('a.categories')})`
      ))
    );

  if (exclude) {
    const excludeQuery = db
      .selectFrom(includeQuery.as('b'))
      .selectAll()
      .where((eb) =>
        eb.and(exclude.map((e) =>
          sql<boolean>`NOT FIND_IN_SET(${e}, ${eb.ref('b.categories')})`
        ))
      );
    return await excludeQuery.execute();
  }

  return await includeQuery.execute();
}

export async function getSquare(squareId: number, trx = db) {
  return await trx
    .with('cats', (_db) => _db
      .selectFrom('categories as c')
      .leftJoin('squareCategories as sc', 'sc.categoryId', 'c.categoryId')
      .select(['sc.squareId', 'c.categoryId'])
    )
    .selectFrom('squares as s')
    .leftJoin('cats', 'cats.squareId', 's.squareId')
    .select([
      's.squareId as id',
      's.content as value',
      's.description as description',
      sql<boolean>`
         if(s.active = true, cast(true as json), cast(false as json))
      `.as('active'),
      ({ fn }) => fn
        .agg('group_concat', ['cats.categoryId'])
        .as('categories')
    ])
    .where('s.squareId', '=', squareId)
    .groupBy('s.squareId')
    .executeTakeFirstOrThrow();
}

export async function addSquare(square: NewSquare, categories: Array<number>) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto('squares')
      .values(square)
      .executeTakeFirstOrThrow();
    const squareId = Number(result.insertId!);
    if (categories.length > 0) {
      await trx
        .insertInto('squareCategories')
        .values(categories.map((categoryId) => ({
          categoryId,
          squareId
        })))
        .execute();
    }
    return await getSquare(squareId, trx);
  });
}

export async function updateSquare(
  squareId: number,
  square: SquareUpdate,
  categories: {
    added: Array<number>;
    removed: Array<number>;
  }
) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('squares')
      .set({
        content: square.content,
        description: square.description,
        active: square.active,
      })
      .where('squareId', '=', squareId)
      .execute();
    if (categories.added.length > 0) {
      await trx
        .insertInto('squareCategories')
        .values(categories.added.map((categoryId) => ({
          categoryId,
          squareId
        })))
        .execute();
    }
    if (categories.removed.length > 0) {
      await trx
        .deleteFrom('squareCategories')
        .where((eb) => eb.and([
          eb('squareId', '=', squareId),
          eb('categoryId', 'in', categories.removed)
        ]))
        .execute();
    }
    return await getSquare(squareId, trx);
  });
}

export async function removeSquare(squareId: number) {
  return await db.transaction().execute(async (trx) => {
    const square = await getSquare(squareId, trx);
    await trx
      .deleteFrom('squareCategories')
      .where('squareId', '=', squareId)
      .execute();
    await trx
      .deleteFrom('squares')
      .where('squareId', '=', squareId)
      .execute();
    return square;
  });
}
