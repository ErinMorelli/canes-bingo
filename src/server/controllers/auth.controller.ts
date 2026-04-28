import bcrypt from 'bcrypt';
import { HttpError } from 'http-errors';

import { getUserByUsername } from './users.controller';

// Generated once at startup. Used as a stand-in hash when the username doesn't
// exist so bcrypt.compare always runs, keeping response time constant.
const DUMMY_HASH = bcrypt.hashSync('__timing_dummy__', 10);

const checkPassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export async function authenticateUser({ username, password }: { username: string; password: string }) {
  let user: Awaited<ReturnType<typeof getUserByUsername>> | undefined;
  try {
    user = await getUserByUsername(username);
  } catch (e) {
    if (!(e instanceof HttpError && e.status === 404)) throw e;
  }
  const isValid = await checkPassword(password, user?.password ?? DUMMY_HASH);
  if (!user || !isValid) return null;
  return { userId: user.userId, username: user.username };
}
