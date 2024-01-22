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

export async function getUser(userId: number) {
  return await db
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
  let updatedUser: UserUpdate = { username: user.username };
  if (user.password) {
    updatedUser.password = await hashPassword(user.password);
  }
  return await db
    .updateTable('users')
    .set(updatedUser)
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then(() => getUser(userId));
}

export async function addUser(user: NewUser) {
  const password = await hashPassword(user.password);
  const newUser = { username: user.username, password };
  return await db
    .insertInto('users')
    .values(newUser)
    .executeTakeFirstOrThrow()
    .then(({ insertId }) => getUser(Number(insertId!)));
}

export async function removeUser(userId: number) {
  const user = await getUser(userId);
  return await db
    .deleteFrom('users')
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()
    .then(() => user);
}
