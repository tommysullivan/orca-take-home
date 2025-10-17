import { describe, it, expect } from "vitest";
import { CheapAirportParkingProvider } from "./CheapAirportParkingProvider.js";
import { ApiSearchParams } from "../common/ApiSearchParams.js";
import { ParkingProviderType } from "../common/ParkingProviderType.js";

describe("CheapAirportParkingProvider Integration Tests", () => {
  const provider = new CheapAirportParkingProvider();

  describe("searchLocations", () => {
    it("should fetch and normalize real Cheap Airport Parking locations for ORD airport", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-10-18T12:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
      };

      const locations = await provider.searchLocations(params);

      // Basic response validation
      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      // Validate first location structure
      const firstLocation = locations[0];
      expect(firstLocation).toBeDefined();
      expect(firstLocation.provider).toBe(
        ParkingProviderType.CHEAP_AIRPORT_PARKING
      );
      expect(firstLocation.provider_id).toBeDefined();
      expect(typeof firstLocation.provider_id).toBe("string");
      expect(firstLocation.name).toBeDefined();
      expect(typeof firstLocation.name).toBe("string");

      // Validate coordinates (if available)
      if (firstLocation.coordinates) {
        expect(typeof firstLocation.coordinates.latitude).toBe("number");
        expect(typeof firstLocation.coordinates.longitude).toBe("number");
        // ORD is around 41.97°N, 87.90°W
        expect(firstLocation.coordinates.latitude).toBeGreaterThan(41);
        expect(firstLocation.coordinates.latitude).toBeLessThan(43);
        expect(firstLocation.coordinates.longitude).toBeLessThan(-87);
        expect(firstLocation.coordinates.longitude).toBeGreaterThan(-88);
      }

      // Validate pricing
      expect(firstLocation.pricing).toBeDefined();
      expect(typeof firstLocation.pricing.daily_rate).toBe("number");
      expect(firstLocation.pricing.daily_rate).toBeGreaterThanOrEqual(0);
      expect(firstLocation.pricing.currency).toBe("USD");

      // Validate amenities
      expect(Array.isArray(firstLocation.amenities)).toBe(true);

      // Validate availability
      expect(typeof firstLocation.availability).toBe("boolean");

      // Validate availability dates
      expect(firstLocation.available_from).toBeDefined();
      expect(firstLocation.available_until).toBeDefined();
      expect(new Date(firstLocation.available_from!).toString()).not.toBe(
        "Invalid Date"
      );
      expect(new Date(firstLocation.available_until!).toString()).not.toBe(
        "Invalid Date"
      );

      // Validate boolean amenity flags
      expect(typeof firstLocation.shuttle_service).toBe("boolean");
      expect(typeof firstLocation.valet_service).toBe("boolean");
      expect(typeof firstLocation.covered_parking).toBe("boolean");

      // Validate provider_data
      expect(firstLocation.provider_data).toBeDefined();
      expect(firstLocation.provider_data?.lot_id).toBeDefined();
      expect(firstLocation.provider_data?.park_id).toBeDefined();
      expect(firstLocation.provider_data?.parking_type).toBeDefined();
      expect(firstLocation.provider_data?.original_data).toBeDefined();

      console.log("\n✅ Sample Cheap Airport Parking Location (ORD):");
      console.log(JSON.stringify(firstLocation, null, 2));
    }, 30000); // 30 second timeout for API call

    it("should fetch and normalize real Cheap Airport Parking locations for LAX airport", async () => {
      const params: ApiSearchParams = {
        airport_code: "LAX",
        start_time: new Date("2025-10-20T09:00:00"),
        end_time: new Date("2025-10-25T09:00:00"),
      };

      const locations = await provider.searchLocations(params);

      // Basic validation
      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      // Validate that all locations have the correct provider
      locations.forEach((location) => {
        expect(location.provider).toBe(
          ParkingProviderType.CHEAP_AIRPORT_PARKING
        );
      });

      // Check that locations are in reasonable proximity to LAX (if coordinates available)
      const firstLocation = locations[0];
      if (firstLocation.coordinates) {
        // LAX is around 33.94°N, 118.41°W
        expect(firstLocation.coordinates.latitude).toBeGreaterThan(33);
        expect(firstLocation.coordinates.latitude).toBeLessThan(35);
        expect(firstLocation.coordinates.longitude).toBeGreaterThan(-119);
        expect(firstLocation.coordinates.longitude).toBeLessThan(-117);
      }

      console.log(
        `\n✅ Found ${locations.length} Cheap Airport Parking locations for LAX`
      );
      console.log("\nSample LAX Location:");
      console.log(`  Name: ${firstLocation.name}`);
      console.log(`  Address: ${firstLocation.address.full_address || "N/A"}`);
      console.log(
        `  Daily Rate: $${firstLocation.pricing.daily_rate.toFixed(2)}`
      );
      console.log(
        `  Distance: ${
          firstLocation.distance_to_airport_miles?.toFixed(2) || "N/A"
        } miles`
      );
      console.log(`  Shuttle: ${firstLocation.shuttle_service ? "Yes" : "No"}`);
      console.log(`  Valet: ${firstLocation.valet_service ? "Yes" : "No"}`);
      console.log(`  Covered: ${firstLocation.covered_parking ? "Yes" : "No"}`);
    }, 30000);

    it("should handle different date ranges correctly", async () => {
      // Test with a short stay (1 day)
      const shortStayParams: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-11-01T08:00:00"),
        end_time: new Date("2025-11-02T08:00:00"),
      };

      const shortStayLocations = await provider.searchLocations(
        shortStayParams
      );
      expect(shortStayLocations.length).toBeGreaterThanOrEqual(0);

      // Test with a longer stay (7 days)
      const longStayParams: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-11-01T08:00:00"),
        end_time: new Date("2025-11-08T08:00:00"),
      };

      const longStayLocations = await provider.searchLocations(longStayParams);
      expect(longStayLocations.length).toBeGreaterThan(0);

      console.log(
        `\n✅ Short stay (1 day): ${shortStayLocations.length} locations`
      );
      console.log(
        `✅ Long stay (7 days): ${longStayLocations.length} locations`
      );

      // Note: Some locations may not be available for short stays
      // (e.g., "Not Available for less than 2 days")
      if (shortStayLocations.length > 0 && longStayLocations.length > 0) {
        const shortPrice = shortStayLocations[0]?.pricing.daily_rate;
        const longPrice = longStayLocations[0]?.pricing.daily_rate;

        if (shortPrice && longPrice) {
          console.log(`\nPricing comparison:`);
          console.log(`  1-day stay: $${shortPrice.toFixed(2)}/day`);
          console.log(`  7-day stay: $${longPrice.toFixed(2)}/day`);
        }
      }
    }, 30000);

    it("should handle amenities correctly", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-10-18T12:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
      };

      const locations = await provider.searchLocations(params);
      expect(locations.length).toBeGreaterThan(0);

      // Find locations with specific amenities
      const shuttleLocations = locations.filter((loc) => loc.shuttle_service);
      const valetLocations = locations.filter((loc) => loc.valet_service);
      const coveredLocations = locations.filter((loc) => loc.covered_parking);

      console.log(`\n✅ Amenity breakdown for ${locations.length} locations:`);
      console.log(`  Shuttle service: ${shuttleLocations.length}`);
      console.log(`  Valet service: ${valetLocations.length}`);
      console.log(`  Covered parking: ${coveredLocations.length}`);

      // Check that amenities array matches boolean flags
      locations.forEach((location) => {
        if (location.shuttle_service) {
          expect(location.amenities).toContain("shuttle");
        }
        if (location.valet_service) {
          expect(location.amenities).toContain("valet");
        }
        if (location.covered_parking) {
          expect(location.amenities).toContain("covered");
        }
      });
    }, 30000);

    it("should provide valid availability information", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-10-18T12:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
      };

      const locations = await provider.searchLocations(params);
      expect(locations.length).toBeGreaterThan(0);

      const availableLocations = locations.filter((loc) => loc.availability);
      const unavailableLocations = locations.filter((loc) => !loc.availability);

      console.log(`\n✅ Availability breakdown:`);
      console.log(`  Available: ${availableLocations.length}`);
      console.log(`  Unavailable: ${unavailableLocations.length}`);

      // Check that available locations have pricing
      availableLocations.forEach((location) => {
        expect(location.pricing.daily_rate).toBeGreaterThan(0);
      });

      // Check for availability messages in provider_data
      unavailableLocations.forEach((location) => {
        if (location.provider_data?.availability_message) {
          console.log(
            `    - ${location.name}: ${location.provider_data.availability_message}`
          );
        }
      });
    }, 30000);

    it("should extract review and rating information", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-10-18T12:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
      };

      const locations = await provider.searchLocations(params);
      expect(locations.length).toBeGreaterThan(0);

      // Find locations with ratings
      const locationsWithRatings = locations.filter(
        (loc) => loc.provider_data?.recommend_percentage
      );

      console.log(
        `\n✅ Found ${locationsWithRatings.length} locations with ratings`
      );

      if (locationsWithRatings.length > 0) {
        const firstRated = locationsWithRatings[0];
        console.log(`\nSample rating info:`);
        console.log(`  Location: ${firstRated.name}`);
        console.log(
          `  Recommend: ${firstRated.provider_data?.recommend_percentage}%`
        );
        console.log(
          `  Reviews: ${firstRated.provider_data?.review_count || "N/A"}`
        );

        expect(firstRated.provider_data?.recommend_percentage).toBeGreaterThan(
          0
        );
        expect(
          firstRated.provider_data?.recommend_percentage
        ).toBeLessThanOrEqual(100);
      }
    }, 30000);

    it("should parse parking types correctly", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: new Date("2025-10-18T12:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
      };

      const locations = await provider.searchLocations(params);
      expect(locations.length).toBeGreaterThan(0);

      // Group by parking type
      const parkingTypes = new Map<string, number>();
      locations.forEach((location) => {
        const type = location.provider_data?.parking_type || "Unknown";
        parkingTypes.set(type, (parkingTypes.get(type) || 0) + 1);
      });

      console.log(`\n✅ Parking types found:`);
      parkingTypes.forEach((count, type) => {
        console.log(`  ${type}: ${count}`);
      });

      // Validate that parking types are extracted
      locations.forEach((location) => {
        expect(location.provider_data?.parking_type).toBeDefined();
        expect(typeof location.provider_data?.parking_type).toBe("string");
      });
    }, 30000);
  });
});
