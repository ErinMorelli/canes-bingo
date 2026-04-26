import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { patternGames, patterns } from '@server/schema';
import type { NewPattern, PatternSquares } from '@server/schema';

const patternSelect = {
  id: patterns.patternId,
  name: patterns.name,
  squares: patterns.squares,
};

export async function getPatterns() {
  return db.select(patternSelect).from(patterns).execute();
}

export async function getPattern(patternId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await trx
    .select(patternSelect)
    .from(patterns)
    .where(eq(patterns.patternId, patternId))
    .limit(1);
  if (!result) throw createHttpError(404, 'Pattern not found');
  return result as typeof result & { squares: PatternSquares };
}

export async function addPattern(newPattern: NewPattern) {
  return await db.transaction(async (trx) => {
    const result = await trx.insert(patterns).values(newPattern);
    const patternId = Number(result[0].insertId);
    return await getPattern(patternId, trx);
  }).catch(handleDbError);
}

export async function updatePattern(patternId: number, updatedPattern: Partial<NewPattern>) {
  return await db.transaction(async (trx) => {
    await trx.update(patterns).set(updatedPattern).where(eq(patterns.patternId, patternId));
    return await getPattern(patternId, trx);
  }).catch(handleDbError);
}

export async function removePattern(patternId: number) {
  return await db.transaction(async (trx) => {
    const pattern = await getPattern(patternId, trx);
    await trx.delete(patternGames).where(eq(patternGames.patternId, patternId));
    await trx.delete(patterns).where(eq(patterns.patternId, patternId));
    return pattern;
  });
}
