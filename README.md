# OCRA - Parking Location Quote Matching System

A TypeScript Node.js application for aggregating and matching parking location quotes across multiple providers (ParkWhiz, SpotHero, Cheap Airport Parking) using PostgreSQL with PostGIS extension and Kysely query builder.

## Features

- 🅿️ **Multi-Provider Aggregation** - Fetches parking locations from ParkWhiz, SpotHero, and Cheap Airport Parking
- � **Intelligent Matching** - Matches the same parking facilities across different providers using fuzzy matching, geolocation, and address analysis
- 🌍 **Geospatial Queries** - Distance calculations and proximity searches using PostGIS
- 📊 **Comprehensive Reports** - Generates Markdown reports, JSON exports, and CSV files for analysis
- 🔄 **Retry with Exponential Backoff** - Handles API rate limiting automatically (4 retries with base-3 exponential backoff)
- ✅ **Extensive Test Coverage** - 79 tests including unit and integration tests with real API calls
- �🐳 **Docker Compose** setup with separate services for app and database
- 🗄️ **PostgreSQL with PostGIS** for geolocation capabilities
- 📦 **TypeScript** with strict type checking
- 🔍 **Kysely Query Builder** for type-safe database operations
- 📊 **Schema Management** with migrations and automatic type generation
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

5. **Run the Application - Generate Parking Location Matches**

```bash
npm run dev    # Development mode with auto-reload
# or
npm start      # Run directly with tsx (no build required)
```

This will:

- Query all three providers (ParkWhiz, SpotHero, Cheap Airport Parking) for LAX and ORD
- Store locations in the database
- Match locations across providers
- Generate reports in `./outputs/` directory:
  - Markdown matching reports
  - JSON exports with raw match data
  - CSV files for spreadsheet analysis
  - Complete JSON datasets with search parameters

## How It Works

### Location Matching Algorithm

The system identifies the same parking facilities across different providers using multiple signals:

1. **Address Analysis (PRIMARY)** - >0.75 similarity required, >0.95 for strong evidence
2. **Name Similarity** - Fuzzy matching with >0.4 minimum threshold, >0.8 for strong evidence
3. **Geographic Proximity** - Locations within 150m considered nearby, under 30m = same location
4. **Price Correlation** - Prices must be within 40% of each other (when price matching is enabled)
5. **Smart Differentiation** - Prevents matching obviously different facilities (e.g., valet vs self-park)

Confidence scores range from 65% (fair) to 95% (excellent) based on the strength of matching signals.

### Provider Integration

- **ParkWhiz**: Multi-step authentication + HTML parsing from search results
- **SpotHero**: Public API with structured JSON responses
- **Cheap Airport Parking**: HTML scraping + batch address detail fetching (5 per batch, 500ms delay)

All providers include automatic retry with exponential backoff for rate limiting (4 retries: 1s, 3s, 9s, 27s).

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

## Available Scripts

### Development

- `npm run dev` - Run the parking location matching system with auto-reload (development mode)
- `npm start` - Run the application directly with tsx (no build step required)
- `npm run type-check` - Run TypeScript type checking without compilation

### Database Management

- `npm run db:setup` - Complete database setup (migrate + generate types + seed) NOTE: this happens automatically once when the dev env is first opened.
- `npm run db:migrate` - Run pending database migrations
- `npm run db:migrate:down` - Rollback the most recent migration
- `npm run db:seed` - Populate database with sample data
- `npm run db:create-migration` - Create a new migration file with timestamp
- `npm run db:generate-types` - Generate TypeScript types from database schema

### Testing

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (auto-rerun on changes)
- `npm run test:unit` - Run unit tests only (excludes integration tests)
- `npm run test:integration` - Run integration tests only (excludes unit tests)

### Advanced (Dev Container)

- `npm run devcontainer:nuke` - Nuclear option: destroy database volume and rebuild (must exit the devcontainer and run in normal vs code then reopen after)

## Development

The dev container includes:

- Node.js 18 with TypeScript support
- PostgreSQL with PostGIS extension (for fast geolocation queries on SQL server side as an enhancement)
- PostgreSQL client tools
- Git and Bash
- VS Code extensions for TypeScript development

### IDEs that don't support devcontainer

VS Code and Jetbrains both support (to varying degrees, vs code being best) the devcontainer standard, which discovers the .devcontainer folder and config to auto build the environment, run some containers, and then drop the developer into one of the containers, where the compiler, terminal, etc all have the required dev tools installed and ready to go with no manual setup.

One can still manage tho, if one is familiar with docker-compose, one would run `docker compose up` and then once things are up and running, one can run `npm run devcontainer:enter` to get a terminal in the dev container and run the commands. Note that in such a case, one will need to manually run the commands in `postCreateCommand` of the [devcontainer.json](./.devcontainer/devcontainer.json) which at the time of this writing are `npm install && npm run db:setup`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (set automatically in dev container)
