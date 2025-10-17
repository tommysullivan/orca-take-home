import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create parking_locations table
  await db.schema
    .createTable("parking_locations")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("provider_id", "varchar(255)", (col) => col.notNull())
    .addColumn("provider", "varchar(100)", (col) => col.notNull())
    .addColumn("name", "varchar(500)", (col) => col.notNull())
    .addColumn("address_street", "varchar(500)", (col) => col.notNull())
    .addColumn("address_city", "varchar(100)", (col) => col.notNull())
    .addColumn("address_state", "varchar(10)", (col) => col.notNull())
    .addColumn("address_zip", "varchar(20)")
    .addColumn("address_full", "text", (col) => col.notNull())
    .addColumn("latitude", "decimal(10, 8)")
    .addColumn("longitude", "decimal(11, 8)")
    .addColumn("distance_to_airport_miles", "decimal(5, 2)")
    .addColumn("daily_rate", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("hourly_rate", "decimal(10, 2)")
    .addColumn("currency", "varchar(3)", (col) =>
      col.notNull().defaultTo("USD")
    )
    .addColumn("amenities", "text", (col) => col.notNull().defaultTo("[]"))
    .addColumn("availability", "boolean", (col) =>
      col.notNull().defaultTo(true)
    )
    .addColumn("shuttle_service", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn("valet_service", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn("covered_parking", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn("provider_data", "text", (col) => col.notNull().defaultTo("{}"))
    .addColumn("search_start_time", "varchar(50)", (col) => col.notNull())
    .addColumn("search_end_time", "varchar(50)", (col) => col.notNull())
    .addColumn("created_at", "varchar(50)", (col) => col.notNull())
    .execute();

  console.log("✅ Created parking_locations table");
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("parking_locations").execute();
  console.log("✅ Dropped parking_locations table");
}
