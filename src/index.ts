import { sql } from "kysely";
import { db } from "./db/database";

// Domain types for our application
interface Point {
  latitude: number;
  longitude: number;
}

interface LocationWithCoordinates {
  id: number;
  name: string;
  location: Point;
  created_at: Date;
  updated_at: Date;
}

// Helper function to parse PostGIS geometry to coordinates
function parseGeometryToPoint(geometryString: string): Point {
  // This is a simple parser for POINT geometry in WKT format
  // In a real application, you might want to use a proper PostGIS library
  const match = geometryString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }
  throw new Error("Invalid geometry format");
}

// Example queries using Kysely with PostGIS
class LocationService {
  // Get all locations with their coordinates
  async getAllLocations(): Promise<LocationWithCoordinates[]> {
    const locations = await db
      .selectFrom("locations")
      .select([
        "id",
        "name",
        "created_at",
        "updated_at",
        sql<string>`ST_AsText(location)`.as("location"),
      ])
      .execute();

    return locations.map((location) => ({
      ...location,
      location: parseGeometryToPoint(location.location),
    }));
  }

  // Find locations within a certain distance (in meters) from a point
  async findNearbyLocations(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<LocationWithCoordinates[]> {
    const locations = await db
      .selectFrom("locations")
      .select([
        "id",
        "name",
        "created_at",
        "updated_at",
        sql<string>`ST_AsText(location)`.as("location"),
        sql<number>`ST_Distance(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography)`.as(
          "distance"
        ),
      ])
      .where(
        sql`ST_DWithin(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, ${radiusMeters})`
      )
      .orderBy("distance")
      .execute();

    return locations.map((location) => ({
      id: location.id,
      name: location.name,
      created_at: location.created_at,
      updated_at: location.updated_at,
      location: parseGeometryToPoint(location.location),
    }));
  }

  // Add a new location
  async addLocation(
    name: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await db
      .insertInto("locations")
      .values({
        name,
        location: sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
      })
      .execute();
  }

  // Get the distance between two locations
  async getDistanceBetweenLocations(
    id1: number,
    id2: number
  ): Promise<number | null> {
    const result = await db
      .selectFrom("locations as l1")
      .innerJoin("locations as l2", sql`true`)
      .select(
        sql<number>`ST_Distance(l1.location::geography, l2.location::geography)`.as(
          "distance"
        )
      )
      .where("l1.id", "=", id1)
      .where("l2.id", "=", id2)
      .executeTakeFirst();

    return result?.distance || null;
  }
}

// Example usage
async function main(): Promise<void> {
  try {
    const locationService = new LocationService();

    console.log("🌍 OCRA Location Service Demo\n");

    // Get all locations
    console.log("📍 All locations:");
    const allLocations = await locationService.getAllLocations();
    allLocations.forEach((location) => {
      console.log(
        `  ${location.name}: (${location.location.latitude}, ${location.location.longitude})`
      );
    });

    // Find locations near Times Square (within 2km)
    console.log("\n🔍 Locations near Times Square (within 2km):");
    const nearbyLocations = await locationService.findNearbyLocations(
      40.758,
      -73.9855,
      2000
    );
    nearbyLocations.forEach((location) => {
      console.log(
        `  ${location.name}: (${location.location.latitude}, ${location.location.longitude})`
      );
    });

    // Calculate distance between two locations
    if (allLocations.length >= 2) {
      const distance = await locationService.getDistanceBetweenLocations(
        allLocations[0].id,
        allLocations[1].id
      );
      console.log(
        `\n📏 Distance between ${allLocations[0].name} and ${
          allLocations[1].name
        }: ${distance ? Math.round(distance) : "unknown"} meters`
      );
    }

    console.log("\n✅ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    // Close the database connection
    await db.destroy();
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  main();
}
