#! /usr/bin/env node

import path from 'path';
import dotenv from 'dotenv';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.local';

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE
};

const dialect = new MysqlDialect({
  pool: createPool(dbConfig)
});

const db = new Kysely({ dialect });

const squares = db.schema
  .createTable('squares')
  .addColumn('square_id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('content', 'varchar(50)', (col) => col.notNull())
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
  .addColumn('group_id', 'integer')
  .addColumn('is_default', 'boolean', (col) => col.defaultTo('false'))
  .addUniqueConstraint('name', ['name'])
  .addForeignKeyConstraint('group_id', ['group_id'], 'groups', ['group_id']);

const squareCategories = db.schema
  .createTable('square_categories')
  .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('category_id', 'integer', (col) => col.notNull())
  .addColumn('square_id', 'integer', (col) => col.notNull())
  .addUniqueConstraint('square_category', ['square_id', 'category_id'])
  .addForeignKeyConstraint('category_id', ['category_id'], 'categories', ['category_id'])
  .addForeignKeyConstraint('square_id', ['square_id'], 'squares', ['square_id']);

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
  config,
  users,
];

async function createAll() {
  return await Promise.all(
    tables.map((table) => {
      table.ifNotExists().execute();
    })
  );
}

createAll()
  .then(() => console.log('Success!'))
  .catch((err) => console.error('ERROR:', err))
  .finally(() => process.exit());
