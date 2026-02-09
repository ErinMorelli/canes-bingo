import { sql } from 'kysely';

import { db } from '../database.ts';
import { GameUpdate, NewGame } from '../types.ts';

function gamesBaseQuery(trx = db) {
  return trx
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
        ))`.as('patterns'),
    ])
    .groupBy('g.gameId');
}

export async function getGames() {
  return await gamesBaseQuery().execute();
}

export async function getGame(gameId: number, trx = db) {
  return await gamesBaseQuery(trx)
    .where('g.gameId', '=', gameId)
    .executeTakeFirstOrThrow();
}

export async function addGame(game: NewGame, patterns: Array<number>) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto('games')
      .values(game)
      .executeTakeFirstOrThrow();
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
    return await getGame(gameId, trx);
  });
}

export async function updateGame(
  gameId: number,
  game: GameUpdate,
  patterns: {
    added: Array<number>;
    removed: Array<number>;
  }
) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('games')
      .set({
        name: game.name,
        description: game.description,
        isDefault: game.isDefault,
      })
      .where('gameId', '=', gameId)
      .execute();
    if (patterns.added.length > 0) {
      await trx
        .insertInto('patternGames')
        .values(patterns.added.map((patternId) => ({
          patternId,
          gameId,
        })))
        .execute();
    }
    if (patterns.removed.length > 0) {
      await trx
        .deleteFrom('patternGames')
        .where((eb) => eb.and([
          eb('gameId', '=', gameId),
          eb('patternId', 'in', patterns.removed)
        ]))
        .execute();
    }
    return await getGame(gameId, trx);
  });
}

export async function removeGame(gameId: number) {
  return await db.transaction().execute(async (trx) => {
    const game = await getGame(gameId, trx);
    await trx
      .deleteFrom('patternGames')
      .where('gameId', '=', gameId)
      .execute();
    await trx
      .deleteFrom('games')
      .where('gameId', '=', gameId)
      .execute();
    return game;
  });
}
