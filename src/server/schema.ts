import { boolean, int, json, mysqlTable, text, unique, varchar } from 'drizzle-orm/mysql-core';

export type PatternSquare = { col: number; row: number };
export type PatternSquares = PatternSquare[];

export const squares = mysqlTable('squares', {
  squareId: int('square_id').primaryKey().autoincrement(),
  content: varchar('content', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
  active: boolean('active').default(true),
}, (t) => [unique('content').on(t.content)]);

export const groups = mysqlTable('groups', {
  groupId: int('group_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  label: varchar('label', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
}, (t) => [unique('name').on(t.name)]);

export const categories = mysqlTable('categories', {
  categoryId: int('category_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  label: varchar('label', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
  groupId: int('group_id').references(() => groups.groupId),
  isDefault: boolean('is_default').default(false),
}, (t) => [unique('name').on(t.name)]);

export const squareCategories = mysqlTable('square_categories', {
  id: int('id').primaryKey().autoincrement(),
  categoryId: int('category_id').notNull().references(() => categories.categoryId, { onDelete: 'cascade' }),
  squareId: int('square_id').notNull().references(() => squares.squareId, { onDelete: 'cascade' }),
}, (t) => [unique('square_category').on(t.squareId, t.categoryId)]);

export const games = mysqlTable('games', {
  gameId: int('game_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
  isDefault: boolean('is_default').default(false),
}, (t) => [unique('name').on(t.name)]);

export const patterns = mysqlTable('patterns', {
  patternId: int('pattern_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  squares: json('squares').$type<PatternSquares>().notNull(),
}, (t) => [unique('name').on(t.name)]);

export const patternGames = mysqlTable('pattern_games', {
  id: int('id').primaryKey().autoincrement(),
  gameId: int('game_id').notNull().references(() => games.gameId, { onDelete: 'cascade' }),
  patternId: int('pattern_id').notNull().references(() => patterns.patternId, { onDelete: 'cascade' }),
}, (t) => [unique('pattern_game').on(t.patternId, t.gameId)]);

export const config = mysqlTable('config', {
  id: int('id').primaryKey().autoincrement(),
  key: varchar('key', { length: 20 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
}, (t) => [unique('key').on(t.key)]);

export const users = mysqlTable('users', {
  userId: int('user_id').primaryKey().autoincrement(),
  username: varchar('username', { length: 32 }).notNull(),
  password: text('password').notNull(),
}, (t) => [unique('username').on(t.username)]);

export type NewSquare = typeof squares.$inferInsert;
export type NewGroup = typeof groups.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
export type NewSquareCategory = typeof squareCategories.$inferInsert;
export type NewGame = typeof games.$inferInsert;
export type NewPattern = typeof patterns.$inferInsert;
export type NewConfig = typeof config.$inferInsert;
export type NewUser = typeof users.$inferInsert;
