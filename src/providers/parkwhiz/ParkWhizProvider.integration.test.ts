import { describe, test, expect } from "vitest";
import { writeFileSync } from "fs";
import { join } from "path";
import { ParkWhizLocation } from "./ParkWhizLocation";
import { parkWhizProvider } from "./ParkWhizProvider";

describe("ParkWhiz Real API End-to-End", () => {
  test("should execute full authentication and location retrieval workflow for ORD", async () => {
    console.log("🚀 Starting end-to-end ParkWhiz API test for ORD...");

    // Execute the full workflow: get token -> autocomplete -> scrape HTML -> extract locations
    const locations = await parkWhizProvider.getLocationsForAirport("ORD");

    // Validate we got real results
    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);

    console.log(`✅ Retrieved ${locations.length} locations for ORD`);

    // Validate location data structure
    const firstLocation = locations[0];
    expect(firstLocation.location_id).toBeDefined();
    expect(firstLocation.type).toBeDefined();
    expect(firstLocation._embedded).toBeDefined();
    expect(firstLocation._embedded["pw:location"]).toBeDefined();
    expect(firstLocation._embedded["pw:location"].name).toBeDefined();

    // Debug the actual structure to understand coordinates location
    console.log(
      "🔍 First location structure keys:",
      Object.keys(firstLocation._embedded["pw:location"])
    );

    // Check for coordinates (they're in the entrances array in real API responses)
    const locationData = firstLocation._embedded["pw:location"] as any;
    expect(locationData.entrances).toBeDefined();
    expect(locationData.entrances[0]).toBeDefined();
    expect(locationData.entrances[0].coordinates).toBeDefined();

    // Log detailed information for first few locations
    console.log("\n📍 Detailed ORD location data:");
    locations
      .slice(0, 5)
      .forEach((location: ParkWhizLocation, index: number) => {
        const locationData = location._embedded["pw:location"] as any;
        console.log(`\n${index + 1}. ${locationData.name}`);
        console.log(`   ID: ${location.location_id}`);
        console.log(`   Address: ${locationData.address1}`);

        if (
          locationData.entrances &&
          locationData.entrances[0] &&
          locationData.entrances[0].coordinates
        ) {
          console.log(
            `   Coordinates: [${locationData.entrances[0].coordinates.join(
              ", "
            )}]`
          );
        }

        if (location.purchase_options && location.purchase_options.length > 0) {
          console.log(`   Price: $${location.purchase_options[0].price.USD}`);
        }

        if (location.distance && location.distance.straight_line) {
          console.log(
            `   Distance: ${location.distance.straight_line.feet} feet from airport`
          );
        }
      });

    // Output to JSON file for inspection
    const outputPath = join(
      process.cwd(),
      "outputs",
      `ORD_parkwhiz_locations_${new Date().toISOString().split("T")[0]}.json`
    );
    writeFileSync(outputPath, JSON.stringify(locations, null, 2));
    console.log(`\n📄 Saved ORD locations to: ${outputPath}`);
  }, 60000); // 60 second timeout for full workflow

  test("should execute full workflow for LAX airport", async () => {
    console.log("🚀 Starting end-to-end ParkWhiz API test for LAX...");

    const locations = await parkWhizProvider.getLocationsForAirport("LAX");

    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);

    console.log(`✅ Retrieved ${locations.length} locations for LAX`);

    // Validate location data structure
    const firstLocation = locations[0];
    expect(firstLocation.location_id).toBeDefined();
    expect(firstLocation.type).toBeDefined();
    expect(firstLocation._embedded).toBeDefined();
    expect(firstLocation._embedded["pw:location"]).toBeDefined();
    expect(firstLocation._embedded["pw:location"].name).toBeDefined();

    // Log detailed information for first few locations
    console.log("\n📍 Detailed LAX location data:");
    locations
      .slice(0, 5)
      .forEach((location: ParkWhizLocation, index: number) => {
        const locationData = location._embedded["pw:location"] as any;
        console.log(`\n${index + 1}. ${locationData.name}`);
        console.log(`   ID: ${location.location_id}`);
        console.log(`   Address: ${locationData.address1}`);

        if (
          locationData.entrances &&
          locationData.entrances[0] &&
          locationData.entrances[0].coordinates
        ) {
          console.log(
            `   Coordinates: [${locationData.entrances[0].coordinates.join(
              ", "
            )}]`
          );
        }

        if (location.purchase_options && location.purchase_options.length > 0) {
          console.log(`   Price: $${location.purchase_options[0].price.USD}`);
        }

        if (location.distance && location.distance.straight_line) {
          console.log(
            `   Distance: ${location.distance.straight_line.feet} feet from airport`
          );
        }
      });

    // Output to JSON file for inspection
    const outputPath = join(
      process.cwd(),
      "outputs",
      `LAX_parkwhiz_locations_${new Date().toISOString().split("T")[0]}.json`
    );
    writeFileSync(outputPath, JSON.stringify(locations, null, 2));
    console.log(`\n📄 Saved LAX locations to: ${outputPath}`);
  }, 60000);
});
