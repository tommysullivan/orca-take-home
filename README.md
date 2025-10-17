# OCRA - Location Services with PostGIS

A TypeScript Node.js application demonstrating geolocation capabilities using PostgreSQL with PostGIS extension and Kysely query builder.

## Features

- 🐳 **Docker Compose** setup with separate services for app and database
- 🗄️ **PostgreSQL with PostGIS** for geolocation capabilities
- 📦 **TypeScript** with strict type checking
- 🔍 **Kysely Query Builder** for type-safe database operations
- 🌍 **Geospatial Queries** including distance calculations and proximity searches
- 📊 **Schema Management** with TypeScript-defined schema and migrations
- 🌱 **Database Seeding** with sample location data

## Getting Started

### Prerequisites

- Docker and Docker Compose (suggest Orbstack over other Docker engines)
- VS Code with Dev Containers extension

### Setup

1. **Open in Dev Container**

   ```bash
   # Open this project in VS Code and select "Reopen in Container"
   # Or use Command Palette: "Dev Containers: Reopen in Container"
   ```

2. **Install Dependencies** (automatically run in postCreateCommand)

   ```bash
   npm install
   ```

3. **Setup Database** (automatically run in postCreateCommand)

```bash
npm run db:setup
```

4. **Run Tests**

```bash
npm test
```

5. **Generate matches + sql records**

```bash
npm run demo
```

## Migration System

This project uses **Kysely's built-in migration system** with automatic file discovery and execution tracking.

### How it works:

- Migration files are auto-discovered by filename in alphanumeric order
- Uses timestamp prefixes (ISO 8601 format): `2024-10-16T00:00:00_migration_name.ts`
- Kysely tracks which migrations have been executed in the database
- Migrations are executed only once and in the correct order
- Supports rolling back migrations with proper `down()` functions

### Creating new migrations:

```bash
# Create a new migration file with timestamp
npm run db:create-migration add_users_table

# This creates: 2024-10-16T12:34:56_add_users_table.ts
```

### Migration file structure:

```typescript
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code - what to apply
}

export async function down(db: Kysely<any>): Promise<void> {
  // Rollback code - how to undo the migration
}
```

### Running migrations:

- `npm run db:migrate` - Runs all pending migrations
- `npm run db:migrate:down` - Rolls back the most recent migration

### Key benefits:

- **Thread-safe**: Uses database-level locks for concurrent execution safety
- **Automatic discovery**: No manual registration of migration files needed
- **Execution tracking**: Kysely maintains a `_prisma_migrations` table automatically
- **Proper ordering**: Ensures migrations run in alphanumeric filename order

## Type Management Strategy

This project uses **`kysely-codegen`** for automatic type generation to eliminate redundant type definitions:

### 🔄 **Automatic Type Generation Workflow**

NOTE: typescript types are generated for the schema automatically as part of `npm run db:setup` which runs when the dev env is initialized.

To modify db schema:

```bash
# 1. Create and run migrations (defines database schema)
npm run db:create-migration add_users_table
npm run db:migrate

# 2. Generate TypeScript types from actual database schema
npm run db:generate-types

# 3. Types are automatically created in src/types/database-generated.ts
```

### Key Benefits:

- **Zero Maintenance**: Types automatically sync with database changes
- **Always Accurate**: Generated from actual database schema, not manually written
- **Type Safety**: Compile-time errors when database and code are out of sync
- **DRY Principle**: Define schema once in migrations, derive types automatically

### Generated Types

These are not committed, and are generated automatically based on current schema:

- `src/db/types/database-generated.ts` - Auto-generated types (created after migrations)

## Development

The dev container includes:

- Node.js 18 with TypeScript support
- PostgreSQL client tools
- Git and Bash
- VS Code extensions for TypeScript development

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (set automatically in dev container)
