import { type Config } from 'drizzle-kit';
import { config } from './src/config';

export default {
    schema: './src/database/schema.ts',
    dialect: 'turso',
    dbCredentials: {
        ...config.database,
    },
} satisfies Config;
