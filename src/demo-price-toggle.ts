#!/usr/bin/env tsx

import { LocationMatchingService } from "./services/location-matching-service";
import { ParkingLocation, ParkingProvider } from "./providers/providers";

/**
 * Demo: Price Matching Toggle Feature
 *
 * This demonstrates how the price matching toggle affects location matching results.
 */

// Create test locations with significant price differences
const testLocations: ParkingLocation[] = [
  {
    provider_id: "pw_test",
    provider: ParkingProvider.PARKWHIZ,
    name: "Airport Plaza Parking",
    address: {
      street: "123 Airport Way",
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
      full_address: "123 Airport Way, Los Angeles, CA 90045",
    },
    coordinates: { latitude: 33.942, longitude: -118.408 },
    airport_code: "LAX",
    distance_to_airport_miles: 1.0,
    pricing: { daily_rate: 20, currency: "USD" },
    amenities: ["shuttle"],
    availability: true,
    shuttle_service: true,
    valet_service: false,
    covered_parking: false,
    provider_data: {},
  },
  {
    provider_id: "sh_test",
    provider: ParkingProvider.SPOTHERO,
    name: "Airport Plaza Parking",
    address: {
      street: "123 Airport Way",
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
      full_address: "123 Airport Way, Los Angeles, CA 90045",
    },
    coordinates: { latitude: 33.942, longitude: -118.408 },
    airport_code: "LAX",
    distance_to_airport_miles: 1.0,
    pricing: { daily_rate: 50, currency: "USD" }, // 150% price difference!
    amenities: ["shuttle"],
    availability: true,
    shuttle_service: true,
    valet_service: false,
    covered_parking: false,
    provider_data: {},
  },
];

async function demonstratePriceToggle() {
  console.log("🎯 PRICE MATCHING TOGGLE DEMONSTRATION");
  console.log("=====================================\n");

  console.log("📍 Test Scenario:");
  console.log('- Same name: "Airport Plaza Parking"');
  console.log('- Same address: "123 Airport Way"');
  console.log("- Same coordinates: 33.942, -118.408");
  console.log("- Different prices: $20 vs $50 (150% difference)");
  console.log("- Price threshold: 40%\n");

  // Test with price matching ENABLED
  console.log("🔹 TEST 1: Price Matching ENABLED (strict)");
  console.log("───────────────────────────────────────────");

  const strictMatcher = new LocationMatchingService({
    name_similarity_threshold: 0.5,
    address_similarity_threshold: 0.7,
    coordinate_distance_threshold_miles: 0.3,
    price_difference_threshold_percent: 0.4, // 40% threshold
    consider_price_in_matching: true, // Price matching ON
  });

  const strictMatches = strictMatcher.findMatches(testLocations);
  console.log(`Matches found: ${strictMatches.length}`);

  if (strictMatches.length === 0) {
    console.log(
      "✅ EXPECTED: No matches due to price difference exceeding 40% threshold"
    );
  } else {
    console.log("❌ UNEXPECTED: Found matches despite large price difference");
  }

  // Test with price matching DISABLED
  console.log("\n🔹 TEST 2: Price Matching DISABLED (flexible)");
  console.log("──────────────────────────────────────────────");

  const flexibleMatcher = new LocationMatchingService({
    name_similarity_threshold: 0.5,
    address_similarity_threshold: 0.7,
    coordinate_distance_threshold_miles: 0.3,
    price_difference_threshold_percent: 0.4,
    consider_price_in_matching: false, // Price matching OFF
  });

  const flexibleMatches = flexibleMatcher.findMatches(testLocations);
  console.log(`Matches found: ${flexibleMatches.length}`);

  if (flexibleMatches.length > 0) {
    console.log(
      "✅ EXPECTED: Found matches based on name/address/location signals"
    );
    console.log(
      `   Confidence: ${(flexibleMatches[0].confidence_score * 100).toFixed(
        1
      )}%`
    );
    console.log(
      `   Providers: ${flexibleMatches[0].locations
        .map((l) => l.provider)
        .join(", ")}`
    );
    console.log(
      `   Price range: $${Math.min(
        ...flexibleMatches[0].locations.map((l) => l.pricing.daily_rate)
      )} - $${Math.max(
        ...flexibleMatches[0].locations.map((l) => l.pricing.daily_rate)
      )}/day`
    );
  } else {
    console.log(
      "❌ UNEXPECTED: No matches found even without price consideration"
    );
  }

  console.log("\n💡 KEY TAKEAWAY:");
  console.log(
    "   - With price matching ON: Rejects matches with large price differences"
  );
  console.log(
    "   - With price matching OFF: Focuses on location signals (name, address, coords)"
  );
  console.log(
    "   - Use price matching when you need price consistency validation"
  );
  console.log(
    "   - Disable price matching when dealing with dynamic/surge pricing scenarios"
  );
}

demonstratePriceToggle().catch(console.error);
