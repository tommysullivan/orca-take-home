import { sql } from "kysely";
import { dbTypesafe } from "../dbTypesafe";

async function seedDatabase(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if locations table has data already
    const existingLocations = await dbTypesafe
      .selectFrom("locations")
      .select("id")
      .limit(1)
      .execute();

    if (existingLocations.length > 0) {
      console.log("📍 Locations already seeded, skipping...");
    } else {
      // Seed sample locations for the demo
      const sampleLocations = [
        { name: "Empire State Building", lat: 40.748817, lng: -73.985428 },
        { name: "Times Square", lat: 40.758, lng: -73.9855 },
        { name: "Central Park", lat: 40.785091, lng: -73.968285 },
        { name: "Brooklyn Bridge", lat: 40.706086, lng: -73.996864 },
        { name: "Statue of Liberty", lat: 40.689247, lng: -74.044502 },
      ];

      for (const location of sampleLocations) {
        await dbTypesafe
          .insertInto("locations")
          .values({
            name: location.name,
            location: sql`ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)`,
          })
          .execute();
      }

      console.log(`📍 Seeded ${sampleLocations.length} sample locations`);
    }

    // Check if parking_locations table needs seeding
    const existingParkingLocations = await dbTypesafe
      .selectFrom("parking_locations")
      .select("id")
      .limit(1)
      .execute();

    if (existingParkingLocations.length > 0) {
      console.log("🅿️  Parking locations already seeded, skipping...");
    } else {
      console.log("🅿️  No parking location seeding implemented yet");
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
