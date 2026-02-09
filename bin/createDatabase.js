#! /usr/bin/env node

import path from 'node:path';
import dotenv from 'dotenv';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env.local'),
  });
}

const dbConfig = {
  uri: process.env.DATABASE_URL
};

const dialect = new MysqlDialect({
  pool: createPool(dbConfig)
});

const db = new Kysely({ dialect });

const squares = db.schema
  .createTable('squares')
  .addColumn('square_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('content', 'varchar(50)', (col) => col.notNull())
  .addColumn('description', 'varchar(255)', (col) => col.notNull())
  .addColumn('active', 'boolean', (col) => col.defaultTo(true))
  .addUniqueConstraint('content', ['content']);

const groups = db.schema
  .createTable('groups')
  .addColumn('group_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('name', 'varchar(50)', (col) => col.notNull())
  .addColumn('label', 'varchar(50)', (col) => col.notNull())
  .addColumn('description', 'varchar(255)')
  .addUniqueConstraint('name', ['name']);

const categories = db.schema
  .createTable('categories')
  .addColumn('category_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('name', 'varchar(50)', (col) => col.notNull())
  .addColumn('label', 'varchar(50)', (col) => col.notNull())
  .addColumn('description', 'varchar(255)')
  .addColumn('group_id', 'integer')
  .addColumn('is_default', 'boolean', (col) => col.defaultTo(false))
  .addUniqueConstraint('name', ['name'])
  .addForeignKeyConstraint('group_id', ['group_id'], 'groups', ['group_id']);

const squareCategories = db.schema
  .createTable('square_categories')
  .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('category_id', 'integer', (col) => col.notNull())
  .addColumn('square_id', 'integer', (col) => col.notNull())
  .addUniqueConstraint('square_category', ['square_id', 'category_id'])
  .addForeignKeyConstraint('category_id', ['category_id'], 'categories', ['category_id'], (cb) => cb.onDelete('cascade'))
  .addForeignKeyConstraint('square_id', ['square_id'], 'squares', ['square_id'], (cb) => cb.onDelete('cascade'));

const games = db.schema
  .createTable('games')
  .addColumn('game_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('name', 'varchar(50)', (col) => col.notNull())
  .addColumn('description', 'varchar(255)')
  .addColumn('is_default', 'boolean', (col) => col.defaultTo(false))
  .addUniqueConstraint('name', ['name']);

const patterns = db.schema
  .createTable('patterns')
  .addColumn('pattern_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('name', 'varchar(50)', (col) => col.notNull())
  .addColumn('squares', 'json', (col) => col.notNull())
  .addUniqueConstraint('name', ['name']);

const patternGames = db.schema
  .createTable('pattern_games')
  .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('game_id', 'integer', (col) => col.notNull())
  .addColumn('pattern_id', 'integer', (col) => col.notNull())
  .addUniqueConstraint('pattern_game', ['pattern_id', 'game_id'])
  .addForeignKeyConstraint('game_id', ['game_id'], 'games', ['game_id'], (cb) => cb.onDelete('cascade'))
  .addForeignKeyConstraint('pattern_id', ['pattern_id'], 'patterns', ['pattern_id'], (cb) => cb.onDelete('cascade'));

const config = db.schema
  .createTable('config')
  .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('key', 'varchar(20)', (col) => col.notNull())
  .addColumn('value', 'varchar(255)', (col) => col.notNull())
  .addUniqueConstraint('key_value', ['key', 'value']);

const users = db.schema
  .createTable('users')
  .addColumn('user_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('username', 'varchar(32)', (col) => col.notNull())
  .addColumn('password', 'text', (col) => col.notNull())
  .addUniqueConstraint('username', ['username']);

const tables = [
  squares,
  groups,
  categories,
  squareCategories,
  games,
  patterns,
  patternGames,
  config,
  users,
];

async function createAll() {
  for (const table of tables) {
    await table.ifNotExists().execute();
  }
}

try {
  await createAll();
  console.log('Success!');
} catch (err) {
  console.error('ERROR:', err);
} finally {
  process.exit();
}
