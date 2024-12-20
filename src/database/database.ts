import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { config } from '../config';

import * as schema from './schema';
import { hashSync } from '@node-rs/bcrypt';
import { migrate } from 'drizzle-orm/libsql/migrator';

export const client = createClient({ ...config.database });
export const db = drizzle(client, { schema });

await migrate(db, {
    migrationsFolder: './drizzle',
});

await db
    .insert(schema.Users)
    .values({ username: 'admin', administrator: true, passwordHash: hashSync('admin') })
    .onConflictDoNothing();
