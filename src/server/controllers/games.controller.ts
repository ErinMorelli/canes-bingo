import { sql } from 'kysely';

import { db } from '../database.ts';
import { GameUpdate, NewGame } from '../types.ts';

export async function getGames() {
  return await db
    .selectFrom('games as g')
    .leftJoin('patternGames as pg', 'g.gameId', 'pg.gameId')
    .leftJoin('patterns as p', 'p.patternId', 'pg.patternId')
    .select([
       'g.gameId as id',
      'g.name as name',
      'g.description as description',
      sql<boolean>`
        if(g.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      sql<any>`
        if(count(p.pattern_id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.pattern_id,
            'name', p.name,
            'squares', p.squares
          )
        ))`.as('patterns')
    ])
    .groupBy('g.gameId')
    .execute();
}

export async function getGame(gameId: number) {
  return await db
    .selectFrom('games as g')
    .leftJoin('patternGames as pg', 'pg.gameId', 'g.gameId')
    .leftJoin('patterns as p', 'p.patternId', 'pg.patternId')
    .select([
      'g.gameId as id',
      'g.name as name',
      'g.description as description',
      sql<boolean>`
        if(g.is_default = true, cast(true as json), cast(false as json))
      `.as('isDefault'),
      sql<any>`
        if(count(p.pattern_id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.pattern_id,
            'name', p.name,
            'squares', p.squares
          )
        ))`.as('patterns')
    ])
    .where('g.gameId', '=', gameId)
    .groupBy('g.gameId')
    .executeTakeFirstOrThrow();
}

export async function addGame(game: NewGame, patterns: Array<number>) {
  const gameId = await db.transaction().execute(async (trx) => {
    return await trx
      .insertInto('games')
      .values(game)
      .executeTakeFirstOrThrow()
      .then(async (result) => {
        const gameId = Number(result.insertId);
        if (patterns.length > 0) {
          await trx
            .insertInto('patternGames')
            .values(patterns.map((patternId) => ({
              patternId,
              gameId,
            })))
            .execute();
        }
        return gameId;
      });
  });
  return await getGame(gameId);
}

export async function updateGame(
  gameId: number,
  game: GameUpdate,
  patterns: {
    added: Array<number>;
    removed: Array<number>;
  }
) {
  await db.transaction().execute(async (trx) => {
    return await trx
      .updateTable('games')
      .set({
        name: game.name,
        description: game.description,
        isDefault: game.isDefault,
      })
      .where('gameId', '=', gameId)
      .execute()
      .then(async () => {
        if (patterns.added.length > 0) {
          await trx
            .insertInto('patternGames')
            .values(patterns.added.map((patternId) => ({
              patternId,
              gameId,
            })))
            .execute();
        }
      })
      .then(async () => {
        if (patterns.removed.length > 0) {
          await trx
            .deleteFrom('patternGames')
            .where((eb) => eb.and([
              eb('gameId', '=', gameId),
              eb('patternId', 'in', patterns.removed)
            ]))
            .execute();
        }
      });
  });
  return await getGame(gameId);
}

export async function removeGame(gameId: number) {
  const game = await getGame(gameId);
  return await db.transaction().execute(async (trx) => {
    return await trx
      .deleteFrom('patternGames')
      .where('gameId', '=', gameId)
      .execute()
      .then(async () => await trx
        .deleteFrom('games')
        .where('gameId', '=', gameId)
        .execute()
      ).then(() => game);
  });
}
