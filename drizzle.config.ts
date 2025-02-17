import type { Config } from 'drizzle-kit'
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_SSL, DB_USER } from './app/db-config.server'

export default {
    schema: './app/db/schema/*',
    out: './app/drizzle',
    dialect: 'postgresql',
    migrations: {
      prefix: "timestamp",
    },
    dbCredentials: {
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
        ssl: DB_SSL,
    },
    verbose: true,
} satisfies Config