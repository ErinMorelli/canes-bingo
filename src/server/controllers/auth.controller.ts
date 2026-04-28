import bcrypt from 'bcrypt';
import { HttpError } from 'http-errors';

import { getUserByUsername } from './users.controller';

// Valid bcrypt hash used as a stand-in when the user doesn't exist, so the
// timing of a failed login is indistinguishable from a wrong-password attempt.
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

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
