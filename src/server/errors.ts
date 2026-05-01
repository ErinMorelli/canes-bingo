import createHttpError, { HttpError } from 'http-errors';

export function handleDbError(e: unknown): never {
  if (e instanceof HttpError) throw e;

  if (typeof e === 'object' && e !== null && 'code' in e) {
    if ((e as { code: string }).code === 'ER_DUP_ENTRY') {
      throw createHttpError(409, 'A record with that value already exists');
    }
  }

  throw e;
}
