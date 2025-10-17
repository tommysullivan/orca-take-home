import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create location_matches table
  await db.schema
    .createTable("location_matches")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("match_id", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("canonical_name", "varchar(500)", (col) => col.notNull())
    .addColumn("canonical_address", "text", (col) => col.notNull())
    .addColumn("latitude", "decimal(10, 8)")
    .addColumn("longitude", "decimal(11, 8)")
    .addColumn("airport_code", "varchar(10)")
    .addColumn("confidence_score", "decimal(5, 4)", (col) => col.notNull())
    .addColumn("provider_ids", "text", (col) => col.notNull())
    .addColumn("match_reasons", "text", (col) => col.notNull())
    .addColumn("search_start_time", "varchar(50)", (col) => col.notNull())
    .addColumn("search_end_time", "varchar(50)", (col) => col.notNull())
    .addColumn("created_at", "varchar(50)", (col) => col.notNull())
    .execute();

  console.log("✅ Created location_matches table");
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("location_matches").execute();
  console.log("✅ Dropped location_matches table");
}
