import { configDotenv } from "dotenv";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

configDotenv();

export const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});
