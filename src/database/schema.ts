// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: int({ mode: 'boolean' }).default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = sqliteTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: integer('creationDate', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Projects = sqliteTable('projects', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    link: text('link').notNull(),
    description: text('description').notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Posts = sqliteTable('posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Downloads = sqliteTable('downloads', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    link: text('link').notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});
