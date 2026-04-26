import { describe, it, expect } from 'vitest';

import { configBodySchema } from './config.validation';
import { groupBodySchema } from './group.validation';
import { categoryBodySchema } from './category.validation';
import { newUserSchema, updateUserSchema } from './user.validation';
import { newSquareSchema, updateSquareSchema } from './square.validation';
import { newGameSchema, updateGameSchema } from './game.validation';

// --- configBodySchema ---

describe('configBodySchema', () => {
  it('accepts a valid config entry', () => {
    const r = configBodySchema.safeParse({ key: 'theme', value: 'dark' });
    expect(r.success).toBe(true);
  });

  it('rejects an empty key', () => {
    const r = configBodySchema.safeParse({ key: '', value: 'dark' });
    expect(r.success).toBe(false);
  });

  it('rejects a missing value', () => {
    const r = configBodySchema.safeParse({ key: 'theme' });
    expect(r.success).toBe(false);
  });
});

// --- groupBodySchema ---

describe('groupBodySchema', () => {
  it('accepts valid group fields', () => {
    const r = groupBodySchema.safeParse({ name: 'players', label: 'Players', description: 'desc' });
    expect(r.success).toBe(true);
  });

  it('accepts a group without description', () => {
    const r = groupBodySchema.safeParse({ name: 'players', label: 'Players' });
    expect(r.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const r = groupBodySchema.safeParse({ name: '', label: 'Players' });
    expect(r.success).toBe(false);
  });

  it('rejects an empty label', () => {
    const r = groupBodySchema.safeParse({ name: 'players', label: '' });
    expect(r.success).toBe(false);
  });
});

// --- categoryBodySchema ---

describe('categoryBodySchema', () => {
  it('accepts valid category fields', () => {
    const r = categoryBodySchema.safeParse({ name: 'general', label: 'General' });
    expect(r.success).toBe(true);
  });

  it('accepts optional groupId and isDefault', () => {
    const r = categoryBodySchema.safeParse({ name: 'general', label: 'General', groupId: 1, isDefault: true });
    expect(r.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const r = categoryBodySchema.safeParse({ name: '', label: 'General' });
    expect(r.success).toBe(false);
  });

  it('rejects an empty label', () => {
    const r = categoryBodySchema.safeParse({ name: 'general', label: '' });
    expect(r.success).toBe(false);
  });
});

// --- newUserSchema / updateUserSchema ---

describe('newUserSchema', () => {
  it('accepts valid username and password', () => {
    const r = newUserSchema.safeParse({ username: 'alice', password: 'secret' });
    expect(r.success).toBe(true);
  });

  it('rejects missing password', () => {
    const r = newUserSchema.safeParse({ username: 'alice' });
    expect(r.success).toBe(false);
  });

  it('rejects missing username', () => {
    const r = newUserSchema.safeParse({ password: 'secret' });
    expect(r.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts username and optional password', () => {
    const r = updateUserSchema.safeParse({ username: 'alice' });
    expect(r.success).toBe(true);
  });

  it('accepts both username and password', () => {
    const r = updateUserSchema.safeParse({ username: 'alice', password: 'newpass' });
    expect(r.success).toBe(true);
  });
});

// --- newSquareSchema / updateSquareSchema ---

describe('newSquareSchema', () => {
  it('accepts minimal valid square', () => {
    const r = newSquareSchema.safeParse({ content: 'Goal!' });
    expect(r.success).toBe(true);
  });

  it('accepts square with all optional fields', () => {
    const r = newSquareSchema.safeParse({ content: 'Goal!', description: 'desc', active: true, categories: [1, 2] });
    expect(r.success).toBe(true);
  });

  it('rejects empty content', () => {
    const r = newSquareSchema.safeParse({ content: '' });
    expect(r.success).toBe(false);
  });
});

describe('updateSquareSchema', () => {
  it('accepts content with category diff', () => {
    const r = updateSquareSchema.safeParse({
      content: 'Updated',
      categories: { added: [3], removed: [1] },
    });
    expect(r.success).toBe(true);
  });

  it('accepts content with no categories', () => {
    const r = updateSquareSchema.safeParse({ content: 'Updated' });
    expect(r.success).toBe(true);
  });

  it('rejects empty content', () => {
    const r = updateSquareSchema.safeParse({ content: '' });
    expect(r.success).toBe(false);
  });
});

// --- newGameSchema / updateGameSchema ---

describe('newGameSchema', () => {
  it('accepts minimal valid game', () => {
    const r = newGameSchema.safeParse({ name: 'Season 1' });
    expect(r.success).toBe(true);
  });

  it('accepts game with all optional fields', () => {
    const r = newGameSchema.safeParse({ name: 'Season 1', description: 'desc', isDefault: true, patterns: [1, 2] });
    expect(r.success).toBe(true);
  });

  it('rejects empty name', () => {
    const r = newGameSchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
  });
});

describe('updateGameSchema', () => {
  it('accepts name with pattern diff', () => {
    const r = updateGameSchema.safeParse({ name: 'Updated', patterns: { added: [2], removed: [1] } });
    expect(r.success).toBe(true);
  });

  it('rejects empty name', () => {
    const r = updateGameSchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
  });
});
