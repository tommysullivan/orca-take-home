import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create unique constraint for provider + provider_id
  await sql`
    CREATE UNIQUE INDEX parking_locations_provider_id_unique 
    ON parking_locations (provider, provider_id)
  `.execute(db);

  // Create indexes for performance
  await sql`
    CREATE INDEX idx_parking_locations_provider 
    ON parking_locations (provider)
  `.execute(db);

  console.log("✅ Created indexes and constraints");
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS parking_locations_provider_id_unique`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_parking_locations_provider`.execute(db);
  console.log("✅ Dropped indexes and constraints");
}
