/**
 * Temporary database types for initial setup.
 * 
 * After running migrations, use:
 * `npm run db:generate-types` 
 * 
 * This will create `database-generated.ts` with actual types from your database.
 * Then replace this import in `src/database.ts`:
 * 
 * Before: type Database = any;
 * After:  import { Database } from './types/database-generated';
 */

import { Generated, ColumnType } from 'kysely';

export interface Database {
  locations: LocationTable;
}

export interface LocationTable {
  id: Generated<number>;
  name: string;
  location: ColumnType<string, string, string>; // PostGIS GEOMETRY stored as WKT string
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}