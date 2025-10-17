import { describe, it, expect } from "vitest";
import { SpotHeroProvider } from "./SpotHeroProvider";
import { ApiSearchParams } from "../common/ApiSearchParams";
import { ParkingProviderType } from "../common/ParkingProviderType";

describe("SpotHeroProvider Integration Tests", () => {
  const provider = new SpotHeroProvider();

  describe("searchLocations", () => {
    it("should fetch and normalize real SpotHero locations for ORD airport", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: "2025-10-18T12:00:00",
        end_time: "2025-10-22T12:00:00",
      };

      const locations = await provider.searchLocations(params);

      // Basic response validation
      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      // Validate first location structure
      const firstLocation = locations[0];
      expect(firstLocation).toBeDefined();
      expect(firstLocation.provider).toBe(ParkingProviderType.SPOTHERO);
      expect(firstLocation.provider_id).toBeDefined();
      expect(typeof firstLocation.provider_id).toBe("string");
      expect(firstLocation.name).toBeDefined();
      expect(typeof firstLocation.name).toBe("string");

      // Validate address
      expect(firstLocation.address).toBeDefined();
      expect(firstLocation.address.street).toBeDefined();
      expect(firstLocation.address.city).toBeDefined();
      expect(firstLocation.address.state).toBeDefined();
      expect(firstLocation.address.zip).toBeDefined();
      expect(firstLocation.address.full_address).toContain(
        firstLocation.address.street
      );

      // Validate coordinates
      expect(firstLocation.coordinates).toBeDefined();
      expect(typeof firstLocation.coordinates?.latitude).toBe("number");
      expect(typeof firstLocation.coordinates?.longitude).toBe("number");
      expect(firstLocation.coordinates!.latitude).toBeGreaterThan(40);
      expect(firstLocation.coordinates!.latitude).toBeLessThan(43);
      expect(firstLocation.coordinates!.longitude).toBeLessThan(-87);
      expect(firstLocation.coordinates!.longitude).toBeGreaterThan(-88);

      // Validate distance
      expect(firstLocation.distance_to_airport_miles).toBeDefined();
      expect(typeof firstLocation.distance_to_airport_miles).toBe("number");
      expect(firstLocation.distance_to_airport_miles!).toBeGreaterThan(0);
      expect(firstLocation.distance_to_airport_miles!).toBeLessThan(20);

      // Validate pricing
      expect(firstLocation.pricing).toBeDefined();
      expect(typeof firstLocation.pricing.daily_rate).toBe("number");
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);
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
      expect(firstLocation.provider_data?.original_data).toBeDefined();

      console.log("\n✅ Sample SpotHero Location (ORD):");
      console.log(JSON.stringify(firstLocation, null, 2));
    }, 30000); // 30 second timeout for API call

    it("should fetch and normalize real SpotHero locations for LAX airport", async () => {
      const params: ApiSearchParams = {
        airport_code: "LAX",
        start_time: "2025-10-20T09:00:00",
        end_time: "2025-10-25T09:00:00",
      };

      const locations = await provider.searchLocations(params);

      // Basic validation
      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      // Validate that all locations have the correct provider
      locations.forEach((location) => {
        expect(location.provider).toBe(ParkingProviderType.SPOTHERO);
      });

      // Check that locations are in reasonable proximity to LAX
      const firstLocation = locations[0];
      if (firstLocation.coordinates) {
        expect(firstLocation.coordinates.latitude).toBeGreaterThan(33);
        expect(firstLocation.coordinates.latitude).toBeLessThan(34.5);
        expect(firstLocation.coordinates.longitude).toBeGreaterThan(-119);
        expect(firstLocation.coordinates.longitude).toBeLessThan(-117);
      }

      console.log(`\n✅ Found ${locations.length} SpotHero locations for LAX`);
      console.log("\nSample LAX Location:");
      console.log(`  Name: ${firstLocation.name}`);
      console.log(`  Address: ${firstLocation.address.full_address}`);
      console.log(`  Daily Rate: $${firstLocation.pricing.daily_rate.toFixed(2)}`);
      console.log(`  Distance: ${firstLocation.distance_to_airport_miles?.toFixed(2)} miles`);
      console.log(`  Shuttle: ${firstLocation.shuttle_service ? "Yes" : "No"}`);
      console.log(`  Valet: ${firstLocation.valet_service ? "Yes" : "No"}`);
    }, 30000);

    it("should handle different date ranges correctly", async () => {
      // Test with a short stay (1 day)
      const shortStayParams: ApiSearchParams = {
        airport_code: "ORD",
        start_time: "2025-11-01T08:00:00",
        end_time: "2025-11-02T08:00:00",
      };

      const shortStayLocations = await provider.searchLocations(shortStayParams);
      expect(shortStayLocations.length).toBeGreaterThan(0);

      // Test with a longer stay (7 days)
      const longStayParams: ApiSearchParams = {
        airport_code: "ORD",
        start_time: "2025-11-01T08:00:00",
        end_time: "2025-11-08T08:00:00",
      };

      const longStayLocations = await provider.searchLocations(longStayParams);
      expect(longStayLocations.length).toBeGreaterThan(0);

      console.log(`\n✅ Short stay (1 day): ${shortStayLocations.length} locations`);
      console.log(`✅ Long stay (7 days): ${longStayLocations.length} locations`);

      // Pricing should be different for different durations
      // (SpotHero API returns different quotes based on duration)
      const shortPrice = shortStayLocations[0]?.pricing.daily_rate;
      const longPrice = longStayLocations[0]?.pricing.daily_rate;
      
      if (shortPrice && longPrice) {
        console.log(`\nPricing comparison for same facility (if available):`);
        console.log(`  1-day stay: $${shortPrice.toFixed(2)}/day`);
        console.log(`  7-day stay: $${longPrice.toFixed(2)}/day`);
      }
    }, 30000);

    it("should handle amenities correctly", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: "2025-10-18T12:00:00",
        end_time: "2025-10-22T12:00:00",
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

      // Most airport parking should have shuttle service
      expect(shuttleLocations.length).toBeGreaterThan(0);

      // Check that amenities array matches boolean flags
      locations.forEach((location) => {
        if (location.shuttle_service) {
          expect(location.amenities).toContain("shuttle");
        }
        if (location.valet_service) {
          expect(location.amenities).toContain("valet");
        }
      });
    }, 30000);

    it("should provide valid availability date ranges", async () => {
      const params: ApiSearchParams = {
        airport_code: "ORD",
        start_time: "2025-10-18T12:00:00",
        end_time: "2025-10-22T12:00:00",
      };

      const locations = await provider.searchLocations(params);
      expect(locations.length).toBeGreaterThan(0);

      const requestStart = new Date(params.start_time);
      const requestEnd = new Date(params.end_time);

      locations.forEach((location) => {
        expect(location.available_from).toBeDefined();
        expect(location.available_until).toBeDefined();

        const availStart = new Date(location.available_from!);
        const availEnd = new Date(location.available_until!);

        // Availability dates should overlap with requested dates
        expect(availStart <= requestEnd).toBe(true);
        expect(availEnd >= requestStart).toBe(true);

        // Availability end should be after availability start
        expect(availEnd > availStart).toBe(true);
      });

      console.log(`\n✅ All ${locations.length} locations have valid availability dates`);
    }, 30000);
  });
});
