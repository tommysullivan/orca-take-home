#!/usr/bin/env tsx

import { spotHeroProvider } from "../src/providers/spotHero/SpotHeroProvider";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to capture real SpotHero data for test validation
 * This helps us understand what the real API returns so we can update tests accordingly
 */
async function captureSpotHeroData() {
  console.log("🔍 Capturing real SpotHero data for test validation...\n");

  const airports = ["LAX", "ORD"];
  const searchParams = {
    start_time: "2025-10-20T10:00:00",
    end_time: "2025-10-22T18:00:00",
  };

  for (const airport of airports) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📍 Airport: ${airport}`);
    console.log(`${"=".repeat(60)}`);

    try {
      const locations = await spotHeroProvider.searchLocations({
        airport_code: airport,
        ...searchParams,
      });

      console.log(`✅ Found ${locations.length} locations\n`);

      if (locations.length > 0) {
        // Show summary stats
        console.log("📊 Summary Statistics:");
        console.log(
          `   Price range: $${Math.min(...locations.map((l) => l.pricing.daily_rate)).toFixed(2)} - $${Math.max(...locations.map((l) => l.pricing.daily_rate)).toFixed(2)}/day`
        );
        const distances = locations
          .map((l) => l.distance_to_airport_miles)
          .filter((d): d is number => d !== undefined);
        if (distances.length > 0) {
          console.log(
            `   Distance range: ${Math.min(...distances).toFixed(2)} - ${Math.max(...distances).toFixed(2)} miles`
          );
        }
        console.log(
          `   With shuttle: ${locations.filter((l) => l.shuttle_service).length}`
        );
        console.log(
          `   With valet: ${locations.filter((l) => l.valet_service).length}`
        );
        console.log(
          `   Covered: ${locations.filter((l) => l.covered_parking).length}\n`
        );

        // Show first 5 locations as examples
        console.log("📋 Sample Locations (first 5):");
        locations.slice(0, 5).forEach((loc, idx) => {
          console.log(`\n${idx + 1}. ${loc.name}`);
          console.log(`   ID: ${loc.provider_id}`);
          console.log(
            `   Address: ${loc.address.street}, ${loc.address.city}, ${loc.address.state}`
          );
          console.log(`   Price: $${loc.pricing.daily_rate.toFixed(2)}/day`);
          if (loc.distance_to_airport_miles !== undefined) {
            console.log(
              `   Distance: ${loc.distance_to_airport_miles.toFixed(2)} miles`
            );
          }
          console.log(`   Shuttle: ${loc.shuttle_service ? "Yes" : "No"}`);
          console.log(`   Valet: ${loc.valet_service ? "Yes" : "No"}`);
          console.log(`   Covered: ${loc.covered_parking ? "Yes" : "No"}`);
          console.log(`   Amenities: ${loc.amenities.join(", ")}`);
        });

        // Save to file for reference
        const outputPath = path.join(
          __dirname,
          "..",
          "outputs",
          `${airport}_spothero_real_data_${new Date().toISOString().split("T")[0]}.json`
        );
        fs.writeFileSync(
          outputPath,
          JSON.stringify(
            {
              airport,
              searchParams,
              capturedAt: new Date().toISOString(),
              count: locations.length,
              locations: locations.map((loc) => ({
                provider_id: loc.provider_id,
                name: loc.name,
                address: loc.address,
                coordinates: loc.coordinates,
                distance_to_airport_miles: loc.distance_to_airport_miles,
                pricing: loc.pricing,
                shuttle_service: loc.shuttle_service,
                valet_service: loc.valet_service,
                covered_parking: loc.covered_parking,
                amenities: loc.amenities,
              })),
            },
            null,
            2
          )
        );
        console.log(`\n💾 Saved full data to: ${outputPath}`);
      } else {
        console.log("⚠️  No locations found");
      }
    } catch (error) {
      console.error(`❌ Error fetching ${airport}:`, error);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Data capture complete!");
  console.log("=".repeat(60));
}

// Run the script
captureSpotHeroData().catch(console.error);
