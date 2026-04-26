import { describe, it, expect } from 'vitest';
import createHttpError from 'http-errors';

import { handleDbError } from './errors';

function dupEntryError() {
  return Object.assign(new Error("Duplicate entry 'foo' for key 'name'"), { code: 'ER_DUP_ENTRY' });
}

describe('handleDbError', () => {
  it('converts ER_DUP_ENTRY to 409 Conflict', () => {
    expect(() => handleDbError(dupEntryError())).toThrow(
      expect.objectContaining({ status: 409, message: 'A record with that value already exists' }),
    );
  });

  it('re-throws an existing HttpError without modifying it', () => {
    const original = createHttpError(404, 'Not found');
    expect(() => handleDbError(original)).toThrow(
      expect.objectContaining({ status: 404, message: 'Not found' }),
    );
  });

  it('re-throws a generic Error unchanged', () => {
    const err = new Error('database connection lost');
    expect(() => handleDbError(err)).toThrow('database connection lost');
  });

  it('re-throws non-ER_DUP_ENTRY MySQL errors unchanged', () => {
    const err = Object.assign(new Error('Table does not exist'), { code: 'ER_NO_SUCH_TABLE' });
    expect(() => handleDbError(err)).toThrow('Table does not exist');
  });

  it('re-throws non-Error values unchanged', () => {
    expect(() => handleDbError('something went wrong')).toThrow();
  });
});
