import { Kysely } from "kysely";
import { dialect } from "./dialect";
import { DB } from "./types/database-generated";

export const dbTypesafe = new Kysely<DB>({
  dialect,
});

export type DBTypesafe = typeof dbTypesafe;
