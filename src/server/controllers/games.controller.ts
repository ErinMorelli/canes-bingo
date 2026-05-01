import { and, eq, inArray, sql } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { games, patternGames, patterns } from '@server/schema';
import type { NewGame, PatternSquares } from '@server/schema';

type GamePattern = { id: number; name: string; squares: PatternSquares };

function gamesBaseQuery(trx: typeof db | DbTransaction = db) {
  return trx
    .select({
      id: games.gameId,
      name: games.name,
      description: games.description,
      isDefault: sql<boolean>`if(${games.isDefault} = true, cast(true as json), cast(false as json))`,
      patterns: sql<GamePattern[]>`
        if(count(${patterns.patternId}) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', ${patterns.patternId},
            'name', ${patterns.name},
            'squares', ${patterns.squares}
          )
        ))`,
    })
    .from(games)
    .leftJoin(patternGames, eq(patternGames.gameId, games.gameId))
    .leftJoin(patterns, eq(patterns.patternId, patternGames.patternId))
    .groupBy(games.gameId);
}

export async function getGames() {
  return gamesBaseQuery().execute();
}

export async function getGame(gameId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await gamesBaseQuery(trx).where(eq(games.gameId, gameId)).limit(1);
  if (!result) throw createHttpError(404, 'Game not found');
  return result;
}

export async function addGame(game: NewGame, patternIds: number[]) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(games).values(game);
    const gameId = Number(result[0].insertId);
    if (patternIds.length > 0) {
      await trx.insert(patternGames).values(patternIds.map((patternId) => ({ patternId, gameId })));
    }
    return await getGame(gameId, trx);
  }).catch(handleDbError);
}

export async function updateGame(
  gameId: number,
  game: Partial<NewGame>,
  patternUpdates: { added: number[]; removed: number[] },
) {
  return await db.transaction(async (trx) => {
    await trx.update(games).set(game).where(eq(games.gameId, gameId));
    if (patternUpdates.added.length > 0) {
      await trx.insert(patternGames).values(
        patternUpdates.added.map((patternId) => ({ patternId, gameId })),
      );
    }
    if (patternUpdates.removed.length > 0) {
      await trx.delete(patternGames).where(
        and(eq(patternGames.gameId, gameId), inArray(patternGames.patternId, patternUpdates.removed)),
      );
    }
    return await getGame(gameId, trx);
  }).catch(handleDbError);
}

export async function removeGame(gameId: number) {
  return await db.transaction(async (trx) => {
    const game = await getGame(gameId, trx);
    await trx.delete(patternGames).where(eq(patternGames.gameId, gameId));
    await trx.delete(games).where(eq(games.gameId, gameId));
    return game;
  });
}
