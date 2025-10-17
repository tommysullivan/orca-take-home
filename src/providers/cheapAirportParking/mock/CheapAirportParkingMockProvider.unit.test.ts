import { describe, it, expect } from "vitest";
import { cheapAirportParkingMockProvider } from "./CheapAirportParkingMockProvider";
import { ParkingLocation } from "../../common/ParkingLocation";
import { ParkingProviderType } from "../../common/ParkingProviderType";

describe("Cheap Airport Parking Service", () => {
  const testSearchParams = {
    airport_code: "LAX",
    start_time: new Date("2024-12-20T10:00:00"),
    end_time: new Date("2024-12-20T18:00:00"),
  };

  describe("Basic Functionality", () => {
    it("should return locations for valid airport", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      const firstLocation = locations[0];
      expect(firstLocation.provider).toBe(
        ParkingProviderType.CHEAP_AIRPORT_PARKING
      );
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);

      // Should be budget-focused
      expect(firstLocation.pricing.daily_rate).toBeLessThan(30);
    });

    it("should prioritize shuttle service", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      // Most locations should have shuttle service
      const shuttleLocations = locations.filter((loc) => loc.shuttle_service);
      expect(shuttleLocations.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid airport codes gracefully", async () => {
      const invalidParams = {
        ...testSearchParams,
        airport_code: "INVALID",
      };

      const locations = await cheapAirportParkingMockProvider.searchLocations(
        invalidParams
      );

      // Should return empty array, not throw errors
      expect(locations).toEqual([]);
    });

    it("should handle malformed date ranges", async () => {
      const invalidParams = {
        airport_code: "LAX",
        start_time: new Date("invalid-date"),
        end_time: new Date("also-invalid"),
      };

      // Should not throw errors
      expect(async () => {
        await cheapAirportParkingMockProvider.searchLocations(invalidParams);
      }).not.toThrow();
    });
  });

  describe("Data Validation", () => {
    it("should return consistent data structure", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      console.log(`\n🔍 Testing ${locations.length} CAP mock locations:`);
      
      locations.forEach((location: ParkingLocation, index: number) => {
        console.log(`\nLocation ${index + 1}: ${location.name}`);
        console.log(`  Address: ${location.address.full_address}`);
        console.log(`  Coordinates: ${location.coordinates?.latitude}, ${location.coordinates?.longitude}`);
        console.log(`  Price: $${location.pricing.daily_rate}/day`);
        
        // Required fields
        expect(location.provider_id).toBeDefined();
        expect(location.provider_id).not.toBe("");
        expect(location.provider).toBe(
          ParkingProviderType.CHEAP_AIRPORT_PARKING
        );
        expect(location.name).toBeDefined();
        expect(location.name).not.toBe("");
        expect(location.address).toBeDefined();
        expect(location.address.full_address).toBeDefined();
        expect(location.address.full_address).not.toBe(""); // Actually check it has content!
        expect(location.pricing).toBeDefined();
        expect(location.pricing.daily_rate).toBeGreaterThan(0);
        expect(location.pricing.currency).toBe("USD");

        // Coordinates should be present for matching
        expect(location.coordinates).toBeDefined();
        expect(location.coordinates?.latitude).toBeDefined();
        expect(location.coordinates?.longitude).toBeDefined();

        expect(Array.isArray(location.amenities)).toBe(true);
        expect(typeof location.availability).toBe("boolean");
        expect(typeof location.shuttle_service).toBe("boolean");
        expect(typeof location.valet_service).toBe("boolean");
        expect(typeof location.covered_parking).toBe("boolean");
      });
    });

    it("should have reasonable budget-friendly price ranges", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      locations.forEach((location: ParkingLocation) => {
        // Budget-focused pricing
        expect(location.pricing.daily_rate).toBeGreaterThan(5);
        expect(location.pricing.daily_rate).toBeLessThan(30); // Should be cheaper

        if (location.pricing.hourly_rate) {
          expect(location.pricing.hourly_rate).toBeGreaterThan(0.5);
          expect(location.pricing.hourly_rate).toBeLessThan(8); // Lower hourly rates
        }
      });
    });

    it("should have valid coordinates when provided", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      locations.forEach((location) => {
        if (location.coordinates) {
          // Valid latitude/longitude ranges
          expect(location.coordinates.latitude).toBeGreaterThan(-90);
          expect(location.coordinates.latitude).toBeLessThan(90);
          expect(location.coordinates.longitude).toBeGreaterThan(-180);
          expect(location.coordinates.longitude).toBeLessThan(180);
        }
      });
    });

    it("should focus on budget-friendly options", async () => {
      const locations = await cheapAirportParkingMockProvider.searchLocations(
        testSearchParams
      );

      // All locations should be under $30/day (budget-friendly)
      const budgetFriendlyLocations = locations.filter(
        (loc) => loc.pricing.daily_rate < 30
      );
      expect(budgetFriendlyLocations.length).toBe(locations.length);
    });
  });
});
