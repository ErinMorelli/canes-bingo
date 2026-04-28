import bcrypt from 'bcrypt';
import { HttpError } from 'http-errors';

import { getUserByUsername } from './users.controller';

const checkPassword = async (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });

export async function authenticateUser({ username, password }: { username: string; password: string }) {
  let user;
  try {
    user = await getUserByUsername(username);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
  const isValid = await checkPassword(password, user.password);
  return isValid ? user : null;
}
