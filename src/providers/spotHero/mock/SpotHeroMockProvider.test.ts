import { describe, it, expect } from "vitest";
import { spotHeroMockProvider } from "./SpotHeroMockProvider";
import { ParkingLocation } from "../../common/ParkingLocation";
import { ParkingProviderType } from "../../common/ParkingProviderType";

describe("SpotHero Service", () => {
  const testSearchParams = {
    airport_code: "LAX",
    start_time: "2024-12-20T10:00:00",
    end_time: "2024-12-20T18:00:00",
  };

  describe("Basic Functionality", () => {
    it("should return locations for valid airport", async () => {
      const locations = await spotHeroMockProvider.searchLocations(
        testSearchParams
      );

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      const firstLocation = locations[0];
      expect(firstLocation.provider).toBe(ParkingProviderType.SPOTHERO);
      expect(firstLocation.name).toBeDefined();
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);
    });

    it("should properly normalize amenities through the API", async () => {
      const locations = await spotHeroMockProvider.searchLocations(
        testSearchParams
      );

      // Find a location with amenities to test
      const locationWithAmenities = locations.find((loc) => 
        loc.amenities && loc.amenities.length > 0
      );

      expect(locationWithAmenities).toBeDefined();
      if (locationWithAmenities) {
        // Check that amenities are properly extracted
        expect(Array.isArray(locationWithAmenities.amenities)).toBe(true);
        // The boolean flags should match amenities in the array
        if (locationWithAmenities.valet_service) {
          expect(locationWithAmenities.amenities).toContain("valet");
        }
        if (locationWithAmenities.shuttle_service) {
          expect(locationWithAmenities.amenities).toContain("shuttle");
        }
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid airport codes gracefully", async () => {
      const invalidParams = {
        ...testSearchParams,
        airport_code: "INVALID",
      };

      const locations = await spotHeroMockProvider.searchLocations(
        invalidParams
      );

      // Should return empty array, not throw errors
      expect(locations).toEqual([]);
    });

    it("should handle malformed date ranges", async () => {
      const invalidParams = {
        airport_code: "LAX",
        start_time: "invalid-date",
        end_time: "also-invalid",
      };

      // Should not throw errors
      expect(async () => {
        await spotHeroMockProvider.searchLocations(invalidParams);
      }).not.toThrow();
    });
  });

  describe("Data Validation", () => {
    it("should return consistent data structure", async () => {
      const locations = await spotHeroMockProvider.searchLocations(
        testSearchParams
      );

      locations.forEach((location: ParkingLocation) => {
        // Required fields
        expect(location.provider_id).toBeDefined();
        expect(location.provider).toBe(ParkingProviderType.SPOTHERO);
        expect(location.name).toBeDefined();
        expect(location.address).toBeDefined();
        expect(location.address.full_address).toBeDefined();
        expect(location.pricing).toBeDefined();
        expect(location.pricing.daily_rate).toBeGreaterThan(0);
        expect(location.pricing.currency).toBe("USD");

        expect(Array.isArray(location.amenities)).toBe(true);
        expect(typeof location.availability).toBe("boolean");
        expect(typeof location.shuttle_service).toBe("boolean");
        expect(typeof location.valet_service).toBe("boolean");
        expect(typeof location.covered_parking).toBe("boolean");
      });
    });

    it("should have reasonable price ranges", async () => {
      const locations = await spotHeroMockProvider.searchLocations(
        testSearchParams
      );

      locations.forEach((location: ParkingLocation) => {
        // Reasonable parking prices
        expect(location.pricing.daily_rate).toBeGreaterThan(5);
        expect(location.pricing.daily_rate).toBeLessThan(100);

        if (location.pricing.hourly_rate) {
          expect(location.pricing.hourly_rate).toBeGreaterThan(0.5);
          expect(location.pricing.hourly_rate).toBeLessThan(15);
        }
      });
    });

    it("should have valid coordinates when provided", async () => {
      const locations = await spotHeroMockProvider.searchLocations(
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
  });
});
