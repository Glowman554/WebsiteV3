// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { blob, int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
    hidden: integer('hidden', { mode: 'boolean' }).default(false).notNull(),
});

export const Downloads = sqliteTable('downloads', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    link: text('link').notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const MicroOSBuilds = sqliteTable('microos_builds', {
    preset: text('preset').primaryKey().notNull(),
    kernel: text('kernel').notNull(),
    symbols: text('symbols').notNull(),
    initrd: text('initrd').notNull(),
    isoUrl: text('iso_url').notNull(),
    updateDate: integer('update_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const MicroOSBuildTokens = sqliteTable('microos_build_tokens', {
    token: text('token').primaryKey().notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const ScaleCache = sqliteTable('scale_cache', {
    url: text('url').primaryKey().notNull(),
    content: blob('content', { mode: 'buffer' }).notNull(),
    creationDate: integer('creation_date', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});
