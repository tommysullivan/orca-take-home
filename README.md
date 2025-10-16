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

4. **Test Everything Works**
   ```bash
   npm run test:connection  # Verify database connectivity
   npm run dev             # Start the demo application
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run the built application
- `npm run db:migrate` - Run all pending migrations to latest
- `npm run db:migrate:down` - Roll back the last migration
- `npm run db:seed` - Seed database with sample data
- `npm run db:setup` - Run migrations and seed data
- `npm run db:create-migration <name>` - Create a new migration file
- `npm run db:generate-types` - Generate TypeScript types from database schema
- `npm run type-check` - Type check without compilation

### Example Usage

The main application demonstrates various geospatial operations:

```typescript
import { LocationService } from "./src/index";

const locationService = new LocationService();

// Get all locations
const locations = await locationService.getAllLocations();

// Find locations within 2km of a point
const nearby = await locationService.findNearbyLocations(
  40.758,
  -73.9855,
  2000
);

// Add a new location
await locationService.addLocation("New York Library", 40.7531, -73.9822);

// Calculate distance between locations
const distance = await locationService.getDistanceBetweenLocations(1, 2);
```

## Database Schema

The application uses a `locations` table with the following structure:

- `id` (serial, primary key)
- `name` (varchar)
- `location` (PostGIS GEOMETRY POINT)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## PostGIS Functions Used

- `ST_SetSRID()` - Set spatial reference system
- `ST_MakePoint()` - Create point geometry
- `ST_Distance()` - Calculate distance between geometries
- `ST_DWithin()` - Find geometries within distance
- `ST_AsText()` - Convert geometry to text format

## Project Structure

```
├── .devcontainer/
│   ├── devcontainer.json       # Dev container configuration
│   ├── docker-compose.yml      # Docker services definition
│   ├── app.Dockerfile          # Node.js app container
│   ├── postgres.Dockerfile     # PostgreSQL + PostGIS container
│   └── init-postgis.sql        # PostGIS initialization
├── src/
│   ├── types/
│   │   ├── database.ts         # Manual fallback types
│   │   └── database-generated.ts # Auto-generated types (created by kysely-codegen)
│   ├── migrations/
│   │   ├── 2024-10-16T00:00:00_create_locations_table.ts
│   │   ├── 2024-10-16T00:01:00_add_location_indexes_and_triggers.ts
│   │   ├── migrate.ts          # Kysely migration runner (up)
│   │   ├── migrate-down.ts     # Kysely migration runner (down)
│   │   ├── create-migration.ts # Migration file generator
│   │   └── seed.ts             # Database seeding
│   ├── database.ts             # Kysely database connection
│   └── index.ts                # Main application with examples
├── package.json
├── tsconfig.json
└── README.md
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

### Manual vs Generated Types:

- `src/types/database.ts` - Manual fallback types for initial setup
- `src/types/database-generated.ts` - Auto-generated types (created after migrations)

### Integration:

The `db:setup` script automatically runs migrations and generates types:

```bash
npm run db:setup  # migrate + seed + generate-types
```

## Development

The dev container includes:

- Node.js 18 with TypeScript support
- PostgreSQL client tools
- Git and Bash
- VS Code extensions for TypeScript development

## Database Management with PostgreSQL Extension

This project includes the **PostgreSQL extension** for VS Code, allowing you to query and explore your database directly within the editor.

### Getting Started with the PostgreSQL Extension

1. **Open PostgreSQL View**

   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run: `Focus on PostgreSQL View`

2. **Add Database Connection**
   - Click the `+` button in the PostgreSQL view to add a new connection
   - Enter your connection details (found in DATABASE_URL in [.env](./.env))

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (set automatically in dev container)

## Sample Data

The application includes sample locations in New York City:

- Statue of Liberty
- Central Park
- Brooklyn Bridge
- Times Square
- Empire State Building
