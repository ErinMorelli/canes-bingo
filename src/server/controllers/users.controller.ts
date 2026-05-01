import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import createHttpError from 'http-errors';

import { db } from '@server/database';
import { handleDbError } from '@server/errors';
import type { DbTransaction } from '@server/database';
import { users } from '@server/schema';
import type { NewUser } from '@server/schema';

const hashPassword = async (password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (error, hash) => {
      if (error) return reject(error);
      return resolve(hash);
    });
  });

export async function getUsers() {
  return db.select({ id: users.userId, username: users.username }).from(users);
}

export async function getUser(userId: number, trx: typeof db | DbTransaction = db) {
  const [result] = await trx
    .select({ id: users.userId, username: users.username })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  if (!result) throw createHttpError(404, 'User not found');
  return result;
}

export async function getUserByUsername(username: string) {
  const [result] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!result) throw createHttpError(404, 'User not found');
  return result;
}

export async function updateUser(userId: number, user: { username?: string; password?: string }) {
  return await db.transaction(async (trx) => {
    const updatedUser: Partial<NewUser> = {};
    if (user.username !== undefined) updatedUser.username = user.username;
    if (user.password) updatedUser.password = await hashPassword(user.password);
    await trx.update(users).set(updatedUser).where(eq(users.userId, userId));
    return await getUser(userId, trx);
  }).catch(handleDbError);
}

export async function addUser(user: NewUser) {
  return await db.transaction(async (trx) => {
    const password = await hashPassword(user.password);
    const result = await trx.insert(users).values({ username: user.username, password });
    const userId = Number(result[0].insertId);
    return await getUser(userId, trx);
  }).catch(handleDbError);
}

export async function removeUser(userId: number) {
  return await db.transaction(async (trx) => {
    const user = await getUser(userId, trx);
    await trx.delete(users).where(eq(users.userId, userId));
    return user;
  });
}
