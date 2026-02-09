import bcrypt from 'bcrypt';

import { db } from '../database.ts';
import { NewUser, UserUpdate } from '../types.ts';

export const hashPassword = async (password: string): Promise<string>  =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (error, hash) =>  {
      if (error) reject(error);
      resolve(hash);
    });
  });

export async function getUsers() {
  return await db
    .selectFrom('users as u')
    .select(['u.userId as id', 'u.username as username'])
    .execute();
}

export async function getUser(userId: number, trx = db) {
  return await trx
    .selectFrom('users as u')
    .select(['u.userId as id', 'u.username as username'])
    .where('u.userId', '=', userId)
    .executeTakeFirstOrThrow();
}

export async function getUserByUsername(username: string) {
  return await db
    .selectFrom('users as u')
    .selectAll()
    .where('u.username', '=', username)
    .executeTakeFirstOrThrow();
}

export async function updateUser(userId: number, user: UserUpdate) {
  return await db.transaction().execute(async (trx) => {
    let updatedUser: UserUpdate = {username: user.username};
    if (user.password) {
      updatedUser.password = await hashPassword(user.password);
    }
    await trx
      .updateTable('users')
      .set(updatedUser)
      .where('userId', '=', userId)
      .executeTakeFirstOrThrow();
    return await getUser(userId, trx);
  });
}

export async function addUser(user: NewUser) {
  return await db.transaction().execute(async (trx) => {
    const password = await hashPassword(user.password);
    const newUser = {username: user.username, password};
    const result = await trx
      .insertInto('users')
      .values(newUser)
      .executeTakeFirstOrThrow();
    const userId = Number(result.insertId);
    return await getUser(userId, trx);
  });
}

export async function removeUser(userId: number) {
  return await db.transaction().execute(async (trx) => {
    const user = await getUser(userId, trx);
    await trx
      .deleteFrom('users')
      .where('userId', '=', userId)
      .executeTakeFirstOrThrow();
    return user;
  });
}
