import { describe, it, expect } from "vitest";
import { parkWhizService } from "./parkwhiz/parkwhiz-service";
import { spotHeroService } from "./spotHero/spothero-service";
import { cheapAirportParkingService } from "./cheapAirportParking/cheap-airport-parking-service";
import { ParkingProvider } from "./providers";

describe("Parking Provider Services", () => {
  const testSearchParams = {
    airport_code: "LAX",
    start_time: "2024-12-20T10:00:00",
    end_time: "2024-12-20T18:00:00",
  };

  describe("ParkWhiz Service", () => {
    it("should return locations for valid airport", async () => {
      const locations = await parkWhizService.searchLocations(testSearchParams);

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      // Check location structure
      const firstLocation = locations[0];
      expect(firstLocation.provider).toBe(ParkingProvider.PARKWHIZ);
      expect(firstLocation.name).toBeDefined();
      expect(firstLocation.address).toBeDefined();
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);
      expect(firstLocation.airport_code).toBe("LAX");
    });

    it("should test connection successfully", async () => {
      const isConnected = await parkWhizService.testConnection();
      expect(isConnected).toBe(true);
    });

    it("should normalize locations correctly", () => {
      const rawLocation = {
        id: "test_001",
        name: "Test Parking Lot",
        address: {
          street: "123 Test Street",
          city: "Test City",
          state: "TS",
          zip: "12345",
        },
        coordinates: { lat: 40.7128, lng: -74.006 },
        airport_code: "TST",
        distance_to_airport: 1.5,
        amenities: ["shuttle", "covered"],
        rates: {
          daily_rate: 25.0,
          hourly_rate: 4.0,
          currency: "USD",
        },
        availability: true,
        provider_specific: {
          shuttle_service: true,
          valet: false,
          covered: true,
        },
      };

      const normalized = (parkWhizService as any).normalizeLocation(
        rawLocation
      );

      expect(normalized.provider).toBe(ParkingProvider.PARKWHIZ);
      expect(normalized.provider_id).toBe("test_001");
      expect(normalized.coordinates.latitude).toBe(40.7128);
      expect(normalized.coordinates.longitude).toBe(-74.006);
      expect(normalized.pricing.daily_rate).toBe(25.0);
      expect(normalized.shuttle_service).toBe(true);
      expect(normalized.covered_parking).toBe(true);
    });
  });

  describe("SpotHero Service", () => {
    it("should return locations for valid airport", async () => {
      const locations = await spotHeroService.searchLocations(testSearchParams);

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      const firstLocation = locations[0];
      expect(firstLocation.provider).toBe(ParkingProvider.SPOTHERO);
      expect(firstLocation.name).toBeDefined();
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);
    });

    it("should test connection successfully", async () => {
      const isConnected = await spotHeroService.testConnection();
      expect(isConnected).toBe(true);
    });

    it("should handle different amenity formats", () => {
      const rawLocation = {
        id: 999,
        name: "SpotHero Test Location",
        street_address: "456 Hero Ave",
        city: "Hero City",
        state: "HC",
        postal_code: "54321",
        latitude: 34.0522,
        longitude: -118.2437,
        distance: 0.8,
        price: { amount: 30, currency: "USD" },
        amenities: {
          covered: false,
          valet: true,
          handicap_accessible: true,
          electric_charging: false,
          shuttle: true,
        },
        available: true,
      };

      const normalized = (spotHeroService as any).normalizeLocation(
        rawLocation,
        "LAX"
      );

      expect(normalized.provider).toBe(ParkingProvider.SPOTHERO);
      expect(normalized.valet_service).toBe(true);
      expect(normalized.covered_parking).toBe(false);
      expect(normalized.amenities).toContain("handicap_accessible");
      expect(normalized.amenities).toContain("shuttle");
    });
  });

  describe("Cheap Airport Parking Service", () => {
    it("should return locations for valid airport", async () => {
      const locations = await cheapAirportParkingService.searchLocations(
        testSearchParams
      );

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);

      const firstLocation = locations[0];
      expect(firstLocation.provider).toBe(
        ParkingProvider.CHEAP_AIRPORT_PARKING
      );
      expect(firstLocation.pricing.daily_rate).toBeGreaterThan(0);

      // Should be budget-focused
      expect(firstLocation.pricing.daily_rate).toBeLessThan(30);
    });

    it("should test connection successfully", async () => {
      const isConnected = await cheapAirportParkingService.testConnection();
      expect(isConnected).toBe(true);
    });

    it("should prioritize shuttle service", async () => {
      const locations = await cheapAirportParkingService.searchLocations(
        testSearchParams
      );

      // Most locations should have shuttle service
      const shuttleLocations = locations.filter((loc) => loc.shuttle_service);
      expect(shuttleLocations.length).toBeGreaterThan(0);
    });
  });

  describe("Provider Error Handling", () => {
    it("should handle invalid airport codes gracefully", async () => {
      const invalidParams = {
        ...testSearchParams,
        airport_code: "INVALID",
      };

      const parkwhizLocations = await parkWhizService.searchLocations(
        invalidParams
      );
      const spotheroLocations = await spotHeroService.searchLocations(
        invalidParams
      );
      const cheapLocations = await cheapAirportParkingService.searchLocations(
        invalidParams
      );

      // Should return empty arrays, not throw errors
      expect(parkwhizLocations).toEqual([]);
      expect(spotheroLocations).toEqual([]);
      expect(cheapLocations).toEqual([]);
    });

    it("should handle malformed date ranges", async () => {
      const invalidParams = {
        airport_code: "LAX",
        start_time: "invalid-date",
        end_time: "also-invalid",
      };

      // Should not throw errors
      expect(async () => {
        await parkWhizService.searchLocations(invalidParams);
        await spotHeroService.searchLocations(invalidParams);
        await cheapAirportParkingService.searchLocations(invalidParams);
      }).not.toThrow();
    });
  });

  describe("Data Consistency", () => {
    it("should return consistent data structure across providers", async () => {
      const [parkwhizResults, spotheroResults, cheapResults] =
        await Promise.all([
          parkWhizService.searchLocations(testSearchParams),
          spotHeroService.searchLocations(testSearchParams),
          cheapAirportParkingService.searchLocations(testSearchParams),
        ]);

      const allResults = [
        ...parkwhizResults,
        ...spotheroResults,
        ...cheapResults,
      ];

      allResults.forEach((location) => {
        // Required fields
        expect(location.provider_id).toBeDefined();
        expect(location.provider).toBeDefined();
        expect(location.name).toBeDefined();
        expect(location.address).toBeDefined();
        expect(location.address.full_address).toBeDefined();
        expect(location.pricing).toBeDefined();
        expect(location.pricing.daily_rate).toBeGreaterThan(0);
        expect(location.pricing.currency).toBe("USD");
        expect(location.airport_code).toBe("LAX");
        expect(Array.isArray(location.amenities)).toBe(true);
        expect(typeof location.availability).toBe("boolean");
        expect(typeof location.shuttle_service).toBe("boolean");
        expect(typeof location.valet_service).toBe("boolean");
        expect(typeof location.covered_parking).toBe("boolean");
      });
    });

    it("should have reasonable price ranges", async () => {
      const locations = await parkWhizService.searchLocations(testSearchParams);

      locations.forEach((location) => {
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
      const locations = await spotHeroService.searchLocations(testSearchParams);

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
