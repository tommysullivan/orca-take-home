#!/usr/bin/env tsx

import { cheapAirportParkingProvider } from "./CheapAirportParkingProvider";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Capture real CheapAirportParking data to understand what to expect in tests
 */
async function captureData() {
  console.log("📡 Capturing real CheapAirportParking data...\n");

  const airports = ["LAX", "ORD"];
  // Use future dates to avoid API errors
  const startTime = new Date("2025-10-20T10:00:00");
  const endTime = new Date("2025-10-22T18:00:00");

  for (const airport of airports) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🛫 ${airport} Airport`);
    console.log("=".repeat(60));

    try {
      const locations = await cheapAirportParkingProvider.searchLocations({
        airport_code: airport,
        start_time: startTime,
        end_time: endTime,
      });

      console.log(`\n${airport}: ✅ Found ${locations.length} locations`);

      if (locations.length > 0) {
        // Calculate statistics
        const prices = locations
          .map((l) => l.pricing.daily_rate)
          .filter((p): p is number => p !== undefined);
        const distances = locations
          .map((l) => l.distance_to_airport_miles)
          .filter((d): d is number => d !== undefined);

        const withShuttle = locations.filter((l) =>
          l.amenities?.includes("shuttle")
        ).length;
        const withValet = locations.filter((l) =>
          l.amenities?.includes("valet")
        ).length;
        const withCovered = locations.filter(
          (l) =>
            l.amenities?.includes("covered") || l.amenities?.includes("indoor")
        ).length;

        console.log(`\n📊 Summary:`);
        if (prices.length > 0) {
          console.log(
            `   Price range: $${Math.min(...prices).toFixed(2)}-$${Math.max(
              ...prices
            ).toFixed(2)}/day`
          );
        }
        if (distances.length > 0) {
          console.log(
            `   Distance range: ${Math.min(...distances).toFixed(2)}-${Math.max(
              ...distances
            ).toFixed(2)} miles`
          );
        }
        console.log(
          `   Amenities: ${withShuttle} with shuttle, ${withValet} with valet, ${withCovered} covered`
        );

        // Show sample locations
        console.log(`\n📍 Sample locations (first 5):`);
        locations.slice(0, 5).forEach((loc, idx) => {
          console.log(`\n${idx + 1}. ${loc.name}`);
          console.log(`   ID: ${loc.provider_id}`);
          console.log(`   Address: ${loc.address?.full_address || "N/A"}`);
          console.log(
            `   Price: $${loc.pricing.daily_rate?.toFixed(2) || "N/A"}/day`
          );
          console.log(
            `   Distance: ${
              loc.distance_to_airport_miles?.toFixed(2) || "N/A"
            } miles`
          );
          if (loc.amenities && loc.amenities.length > 0) {
            console.log(`   Amenities: ${loc.amenities.join(", ")}`);
          }
        });

        // Save to file
        const outputDir = path.join(__dirname, "..", "..", "..", "outputs");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date()
          .toISOString()
          .split(".")[0]
          .replace(/:/g, "-");
        const filename = path.join(
          outputDir,
          `${airport}_cheapairportparking_real_data_${timestamp}.json`
        );

        fs.writeFileSync(filename, JSON.stringify(locations, null, 2));
        console.log(`\n💾 Saved: ${filename}`);
      } else {
        console.log(`⚠️  No locations found for ${airport}`);
      }
    } catch (error) {
      console.error(`\n❌ Error fetching ${airport}:`, error);
    }
  }

  console.log("\n\n✅ Data capture complete!\n");
}

captureData().catch(console.error);
