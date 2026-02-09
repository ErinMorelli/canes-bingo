import { db } from '../database.ts';
import { NewPattern, PatternUpdate } from '../types.ts';

const PATTERN_COLUMNS = [
  'p.patternId as id',
  'p.name as name',
  'p.squares as squares',
] as const;

export async function getPatterns() {
  return await db
    .selectFrom('patterns as p')
    .select(PATTERN_COLUMNS)
    .execute();
}

export async function getPattern(patternId: number, trx = db) {
  return await trx
    .selectFrom('patterns as p')
    .select(PATTERN_COLUMNS)
    .where('p.patternId', '=', patternId)
    .executeTakeFirstOrThrow();
}

export async function addPattern(newPattern: NewPattern) {
  return await db
    .insertInto('patterns')
    .values(newPattern)
    .executeTakeFirstOrThrow()
    .then(({ insertId }) => getPattern(Number(insertId)));
}

export async function updatePattern(patternId: number, updatedPattern: PatternUpdate) {
  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('patterns')
      .set(updatedPattern)
      .where('patternId', '=', patternId)
      .execute();
    return await getPattern(patternId, trx);
  });
}

export async function removePattern(patternId: number) {
  return await db.transaction().execute(async (trx) => {
    const pattern = await getPattern(patternId, trx);
    await trx
      .deleteFrom('patternGames')
      .where('patternId', '=', patternId)
      .execute();
    await trx
      .deleteFrom('patterns')
      .where('patternId', '=', patternId)
      .execute();
    return pattern;
  });
}
