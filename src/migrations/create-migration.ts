#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import * as path from 'path';

async function createMigration(): Promise<void> {
  const args = process.argv.slice(2);
  const migrationName = args[0];

  if (!migrationName) {
    console.error('Usage: npm run db:create-migration <migration_name>');
    console.error('Example: npm run db:create-migration add_users_table');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `${timestamp}_${migrationName}.ts`;
  const migrationPath = path.join(__dirname, filename);

  const template = `import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // TODO: Implement your migration here
}

export async function down(db: Kysely<any>): Promise<void> {
  // TODO: Implement your rollback here
}
`;

  try {
    await fs.writeFile(migrationPath, template);
    console.log(`Created migration file: ${filename}`);
  } catch (error) {
    console.error('Failed to create migration file:', error);
    process.exit(1);
  }
}

createMigration();