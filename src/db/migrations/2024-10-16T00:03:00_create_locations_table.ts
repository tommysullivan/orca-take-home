import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create locations table with PostGIS geometry support
  await db.schema
    .createTable('locations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('location', sql`GEOMETRY(POINT, 4326)`, (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  // Create a spatial index on the geometry column for better query performance
  await sql`CREATE INDEX idx_locations_location ON locations USING GIST (location)`.execute(db);

  console.log('✅ Created locations table with PostGIS support');
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_locations_location`.execute(db);
  await db.schema.dropTable('locations').execute();
  console.log('✅ Dropped locations table and spatial index');
}