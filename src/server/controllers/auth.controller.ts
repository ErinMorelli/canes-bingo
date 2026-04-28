import bcrypt from 'bcrypt';
import { HttpError } from 'http-errors';

import { getUserByUsername } from './users.controller';

const checkPassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export async function authenticateUser({ username, password }: { username: string; password: string }) {
  let user;
  try {
    user = await getUserByUsername(username);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
  const isValid = await checkPassword(password, user.password);
  if (!isValid) return null;
  return { userId: user.userId, username: user.username };
}
