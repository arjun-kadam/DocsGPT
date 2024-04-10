import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env' })

export default {
  driver: 'pg',
  schema: './lib/db/schema.ts',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
