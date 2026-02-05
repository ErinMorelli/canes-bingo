import { db } from '../database.ts';
import { NewPattern, PatternUpdate } from '../types.ts';

export async function getPatterns() {
  return await db
    .selectFrom('patterns as p')
    .select([
      'p.patternId as id',
      'p.name as name',
      'p.squares as squares',
    ])
    .execute();
}

export async function getPattern(patternId: number) {
  return await db
    .selectFrom('patterns as p')
    .select([
      'p.patternId as id',
      'p.name as name',
      'p.squares as squares',
    ])
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
  return await db
    .updateTable('patterns')
    .set(updatedPattern)
    .where('patternId', '=', patternId)
    .execute()
    .then(() => getPattern(patternId));
}

export async function removePattern(patternId: number) {
  const pattern = await getPattern(patternId);
  return await db.transaction().execute(async (trx) => {
    return trx
      .deleteFrom('patternGames')
      .where('patternId', '=', patternId)
      .execute()
      .then(async () => await trx
        .deleteFrom('patterns')
        .where('patternId', '=', patternId)
        .execute()
      ).then(() => pattern);
  });
}
