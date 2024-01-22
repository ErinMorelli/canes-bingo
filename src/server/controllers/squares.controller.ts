import { sql } from 'kysely';

import { db } from '../database.ts';
import { NewSquare, SquareUpdate } from '../types.ts';

export async function getSquares(
  include?: Array<string>,
  exclude?: Array<string>
) {
  if (!include && !exclude) {
    return await db
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
        ({ fn }) => fn
          .agg('group_concat', ['cats.categoryId'])
          .as('categories')
      ])
      .groupBy('s.squareId')
      .execute();
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
      ({ fn }) => fn
        .agg('group_concat', ['cats.name'])
        .as('categories')
    ])
    .groupBy('s.squareId');

  let query = db
    .selectFrom(baseQuery.as('result'))
    .select(['result.id', 'result.value'])
    .where((eb) =>
      eb.or(include!.map((i) =>
        sql<boolean>`FIND_IN_SET(${i}, ${eb.ref('result.categories')})`
      ))
    );

  if (exclude) {
    query = query.where((eb) =>
      eb.and(exclude.map((e) =>
        sql<boolean>`NOT FIND_IN_SET(${e}, ${eb.ref('result.categories')})`
      ))
    )
  }

  return await query.execute();
}

export async function getSquare(squareId: number) {
  return await db
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
      ({ fn }) => fn
        .agg('group_concat', ['cats.categoryId'])
        .as('categories')
    ])
    .where('s.squareId', '=', squareId)
    .groupBy('s.squareId')
    .executeTakeFirstOrThrow();
}

export async function addSquare(square: NewSquare, categories: Array<number>) {
  return await db
    .insertInto('squares')
    .values(square)
    .executeTakeFirstOrThrow()
    .then(async (result) => {
      const squareId = Number(result.insertId!);
      if (categories.length > 0) {
        await db
          .insertInto('squareCategories')
          .values(categories.map((categoryId) => ({
            categoryId,
            squareId
          })))
          .execute();
      }
      return squareId;
    })
    .then((squareId) => getSquare(squareId));
}

export async function updateSquare(
  squareId: number,
  square: SquareUpdate,
  categories: {
    added: Array<number>;
    removed: Array<number>;
  }
) {
  return await db
    .updateTable('squares')
    .set({ content: square.content })
    .where('squareId', '=', squareId)
    .executeTakeFirstOrThrow()
    .then(async () => {
      if (categories.added.length > 0) {
        await db
          .insertInto('squareCategories')
          .values(categories.added.map((categoryId) => ({
            categoryId,
            squareId
          })))
          .execute();
      }
    }).then(async () => {
      if (categories.removed.length > 0) {
        await db
          .deleteFrom('squareCategories')
          .where((eb) => eb.and([
            eb('squareId', '=', squareId),
            eb('categoryId', 'in', categories.removed)
          ]))
          .execute();
      }
    }).then(() => getSquare(squareId));
}

export async function removeSquare(squareId: number) {
  const square = await getSquare(squareId);
  return await db
    .deleteFrom('squareCategories')
    .where('squareId', '=', squareId)
    .executeTakeFirstOrThrow()
    .then(async () => await db
      .deleteFrom('squares')
      .where('squareId', '=', squareId)
      .executeTakeFirstOrThrow()
    ).then(() => square);
}
