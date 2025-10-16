import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add an index on the name column for faster text searches
  await sql`CREATE INDEX idx_locations_name ON locations USING GIN (to_tsvector('english', name))`.execute(db);
  
  // Add a trigger to automatically update the updated_at timestamp
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `.execute(db);

  await sql`
    CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS update_locations_updated_at ON locations`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_locations_name`.execute(db);
}