import bcrypt from 'bcrypt';

import { getUserByUsername } from './users.controller';

const checkPassword = async (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });

export async function authenticateUser({ username, password }: { username: string; password: string }) {
  try {
    const user = await getUserByUsername(username);
    const isValid = await checkPassword(password, user.password);
    return isValid ? user : null;
  } catch {
    return null;
  }
}
