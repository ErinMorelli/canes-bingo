import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

vi.mock('./users.controller.ts', () => ({
  getUserByUsername: vi.fn(),
}));

import { authenticateUser } from './auth.controller.ts';
import { getUserByUsername } from './users.controller.ts';

const mockGetUserByUsername = vi.mocked(getUserByUsername);

describe('authenticateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the user for valid credentials', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    mockGetUserByUsername.mockResolvedValue({
      userId: 1,
      username: 'alice',
      password: hash,
      createdAt: new Date(),
    } as any);

    const result = await authenticateUser({ username: 'alice', password: 'correct-password' });
    expect(result).toMatchObject({ userId: 1, username: 'alice' });
  });

  it('returns null for an incorrect password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    mockGetUserByUsername.mockResolvedValue({
      userId: 1,
      username: 'alice',
      password: hash,
    } as any);

    const result = await authenticateUser({ username: 'alice', password: 'wrong-password' });
    expect(result).toBeNull();
  });

  it('returns null when the user does not exist', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('User not found'));

    const result = await authenticateUser({ username: 'unknown', password: 'password' });
    expect(result).toBeNull();
  });

  it('returns null when getUserByUsername throws unexpectedly', async () => {
    mockGetUserByUsername.mockRejectedValue(new Error('DB connection failed'));

    const result = await authenticateUser({ username: 'alice', password: 'password' });
    expect(result).toBeNull();
  });
});
