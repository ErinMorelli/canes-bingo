import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { AuthRequest, User } from '../types.ts';

import { getUser, getUserByUsername } from './users.controller.ts';

const SECRET_KEY = process.env.SECRET_KEY || '';

export const checkPassword = async (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });

export async function authenticateUser({ username, password }: AuthRequest) {
  const user = await getUserByUsername(username);
  const isValid = await checkPassword(password, user.password);
  return isValid ? user : null;
}

export function createUserToken({ userId, username }: User) {
  return jwt.sign(
    { userId: userId.toString(), username },
    SECRET_KEY,
    { expiresIn: '2d' }
  );
}

export async function validateUserToken(token?: string) {
  if (!token) return false;
  try {
    const userData = jwt.verify(token, SECRET_KEY);
    if (typeof userData === 'string') return false;
    const {userId, username} = userData;
    const user = await getUser(Number.parseInt(userId));
    return user.username === username ? user : false;
  } catch {
    return false;
  }
}
