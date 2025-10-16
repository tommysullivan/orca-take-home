import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./types/database-generated";
import * as dotenv from "dotenv";

dotenv.config();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@postgres:5432/ocra_dev",
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
