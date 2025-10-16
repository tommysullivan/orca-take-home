import { sql } from "kysely";
import { db } from "./database";

// Simple domain types for the application layer
type LocationInput = {
  name: string;
  latitude: number;
  longitude: number;
};

type LocationWithCoords = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
};

type LocationWithDistance = LocationWithCoords & {
  distance_meters: number;
};

// Production-ready LocationService
export class LocationService {
  // Get all locations with extracted coordinates
  async getAllLocations(): Promise<LocationWithCoords[]> {
    const locations = await db
      .selectFrom("locations")
      .select([
        "id",
        "name",
        "created_at",
        "updated_at",
        sql<number>`ST_Y(location)`.as("latitude"),
        sql<number>`ST_X(location)`.as("longitude"),
      ])
      .execute();

    return locations;
  }

  // Find locations within radius (meters) from a point
  async findNearbyLocations(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<LocationWithDistance[]> {
    const locations = await db
      .selectFrom("locations")
      .select([
        "id",
        "name",
        "created_at",
        "updated_at",
        sql<number>`ST_Y(location)`.as("latitude"),
        sql<number>`ST_X(location)`.as("longitude"),
        sql<number>`ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography)`.as(
          "distance_meters"
        ),
      ])
      .where(
        sql<boolean>`ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})`
      )
      .orderBy("distance_meters")
      .execute();

    return locations;
  }

  // Add a new location
  async addLocation(
    input: LocationInput
  ): Promise<{ id: number; name: string }> {
    const result = await db
      .insertInto("locations")
      .values({
        name: input.name,
        location: sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)`,
      })
      .returning(["id", "name"])
      .executeTakeFirstOrThrow();

    return result;
  }

  // Get the distance between two locations by ID
  async getDistanceBetweenLocations(
    id1: number,
    id2: number
  ): Promise<number | null> {
    const result = await db
      .selectFrom("locations")
      .select(
        sql<number>`
        ST_Distance(
          location::geography, 
          (SELECT location::geography FROM locations WHERE id = ${id2})
        )
      `.as("distance")
      )
      .where("id", "=", id1)
      .executeTakeFirst();

    return result?.distance ?? null;
  }

  // Update location coordinates
  async updateLocationCoordinates(
    id: number,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await db
      .updateTable("locations")
      .set({
        location: sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id)
      .execute();
  }

  // Delete location
  async deleteLocation(id: number): Promise<void> {
    await db.deleteFrom("locations").where("id", "=", id).execute();
  }

  // Update location name
  async updateLocationName(
    id: number,
    newName: string
  ): Promise<{ id: number; name: string } | null> {
    const result = await db
      .updateTable("locations")
      .set({
        name: newName,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id)
      .returning(["id", "name"])
      .executeTakeFirst();

    return result ?? null;
  }

  // Get raw location data (for debugging/admin purposes)
  async getRawLocations(): Promise<any[]> {
    return await db.selectFrom("locations").selectAll().execute();
  }
}

// Database diagnostics and health checks
export class DatabaseDiagnostics {
  // Test basic database connection
  async testConnection(): Promise<{ connected: boolean; tablesCount: number }> {
    try {
      const result = await sql<{ table_name: string }>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `.execute(db);

      return { connected: true, tablesCount: result.rows.length };
    } catch (error) {
      console.error("Database connection failed:", error);
      return { connected: false, tablesCount: 0 };
    }
  }

  // Check PostGIS extension availability
  async checkPostGIS(): Promise<boolean> {
    try {
      const result = await sql<{ routine_name: string }>`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name = 'st_makepoint'
      `.execute(db);

      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get database schema information
  async getDatabaseInfo(): Promise<{ tables: string[]; extensions: string[] }> {
    try {
      const tablesResult = await sql<{ table_name: string }>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `.execute(db);

      const extensionsResult = await sql<{ routine_name: string }>`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name LIKE 'st_%' 
        LIMIT 5
      `.execute(db);

      return {
        tables: tablesResult.rows.map((t) => t.table_name),
        extensions: extensionsResult.rows.map((e) => e.routine_name),
      };
    } catch (error) {
      return { tables: [], extensions: [] };
    }
  }
}

// Demo application
async function runDemo(): Promise<void> {
  const locationService = new LocationService();
  const diagnostics = new DatabaseDiagnostics();

  try {
    console.log("🌍 OCRA Location Service Demo\n");

    // Database health check
    console.log("🔍 Database Health Check:");
    const connectionStatus = await diagnostics.testConnection();
    console.log(`  📊 Connected: ${connectionStatus.connected ? "✅" : "❌"}`);
    console.log(`  📋 Tables found: ${connectionStatus.tablesCount}`);

    const hasPostGIS = await diagnostics.checkPostGIS();
    console.log(`  🌍 PostGIS available: ${hasPostGIS ? "✅" : "❌"}`);

    const dbInfo = await diagnostics.getDatabaseInfo();
    console.log(`  📁 Tables: ${dbInfo.tables.join(", ")}`);
    console.log(
      `  🧩 PostGIS functions: ${dbInfo.extensions.slice(0, 3).join(", ")}...\n`
    );

    // Get current locations
    console.log("📍 Current locations:");
    const allLocations = await locationService.getAllLocations();
    allLocations.forEach((location) => {
      console.log(
        `  ${location.name}: (${location.latitude.toFixed(
          4
        )}, ${location.longitude.toFixed(4)})`
      );
    });

    // Show raw data for first location (debugging example)
    if (allLocations.length > 0) {
      console.log("\n🔬 Raw data example (first location):");
      const rawLocations = await locationService.getRawLocations();
      const firstRaw = rawLocations[0];
      console.log(`  ID: ${firstRaw.id}, Name: ${firstRaw.name}`);
      console.log(`  Created: ${firstRaw.created_at}`);
      console.log(`  Location (PostGIS): ${firstRaw.location}`);
    }

    // Add a new location
    console.log("\n➕ Adding a new location...");
    const newLocation = await locationService.addLocation({
      name: "Brooklyn Museum",
      latitude: 40.6712,
      longitude: -73.9636,
    });
    console.log(`Added: ${newLocation.name} (ID: ${newLocation.id})`);

    // Test update functionality
    console.log("\n✏️  Testing update functionality...");
    const updateResult = await locationService.updateLocationName(
      newLocation.id,
      "Brooklyn Museum of Art"
    );
    if (updateResult) {
      console.log(
        `Updated location ${updateResult.id}: "${updateResult.name}"`
      );
    }

    // Find locations near Times Square (within 2km)
    console.log("\n🔍 Locations near Times Square (within 2km):");
    const nearbyLocations = await locationService.findNearbyLocations(
      40.758,
      -73.9855,
      2000
    );
    nearbyLocations.forEach((location) => {
      console.log(
        `  ${location.name}: ${(location.distance_meters / 1000).toFixed(
          2
        )}km away`
      );
    });

    // Calculate distance between first two locations
    if (allLocations.length >= 2) {
      const distance = await locationService.getDistanceBetweenLocations(
        allLocations[0].id,
        allLocations[1].id
      );
      console.log(
        `\n📏 Distance between ${allLocations[0].name} and ${
          allLocations[1].name
        }: ${distance ? (distance / 1000).toFixed(2) : "unknown"} km`
      );
    }

    console.log("\n✅ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo()
    .catch((error) => {
      console.error("❌ Demo failed:", error);
      process.exit(1);
    })
    .then(() => {
      console.log("👋 Exiting...");
      process.exit(0);
    });
}
