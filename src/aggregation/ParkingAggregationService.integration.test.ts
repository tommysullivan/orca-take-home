import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbTypesafe } from "../db/dbTypesafe";
import { ParkingProvider } from "../providers/common/ParkingProvider";
import { ParkingProviderType } from "../providers/common/ParkingProviderType";
import { LocationMatchingService } from "../locationMatching/LocationMatchingService";
import { ParkingAggregationService } from "./ParkingAggregationService";

// Import the real and mock services
import { cheapAirportParkingMockProvider } from "../providers/cheapAirportParking/mock/CheapAirportParkingMockProvider";
import { parkWhizProvider } from "../providers/parkwhiz/ParkWhizProvider";
import { spotHeroProvider } from "../providers/spotHero/SpotHeroProvider";

describe("ParkingAggregationService - Real Tests", () => {
  let service: ParkingAggregationService;
  let providers: Record<ParkingProviderType, ParkingProvider>;
  let locationMatchingService: LocationMatchingService;

  beforeEach(() => {
    // Use real ParkWhiz + real SpotHero services, mock for CheapAirportParking
    providers = {
      [ParkingProviderType.PARKWHIZ]: parkWhizProvider,
      [ParkingProviderType.SPOTHERO]: spotHeroProvider, // Now using real SpotHero!
      [ParkingProviderType.CHEAP_AIRPORT_PARKING]:
        cheapAirportParkingMockProvider, // Still mock for now
    };

    locationMatchingService = new LocationMatchingService();
    service = new ParkingAggregationService(
      dbTypesafe,
      providers,
      locationMatchingService
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchParkingWithMatching - Real Integration", () => {
    it("should search with real ParkWhiz and SpotHero services", async () => {
      const searchParams = {
        airport_code: "LAX",
        start_time: "2025-10-20T10:00:00",
        end_time: "2025-10-22T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      expect(results).toBeDefined();
      expect(results.locations).toBeDefined();
      expect(results.matches).toBeDefined();
      expect(results.summary).toBeDefined();

      expect(Array.isArray(results.locations)).toBe(true);
      expect(Array.isArray(results.matches)).toBe(true);
      expect(results.summary.providers_count).toBe(3);
      expect(results.summary.search_duration_ms).toBeGreaterThan(0);

      // Should have locations from all providers (real ParkWhiz + real SpotHero + mock CAP)
      const parkwhizLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.PARKWHIZ
      );
      const spotheroLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.SPOTHERO
      );
      const capLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.CHEAP_AIRPORT_PARKING
      );

      // Real SpotHero should return actual data for LAX (~54 locations as of Oct 2025)
      expect(spotheroLocations.length).toBeGreaterThan(40);
      // Verify SpotHero data quality
      spotheroLocations.slice(0, 5).forEach((loc) => {
        expect(loc.name).toBeDefined();
        expect(loc.pricing.daily_rate).toBeGreaterThan(0);
        expect(loc.pricing.daily_rate).toBeLessThan(100);
        expect(loc.distance_to_airport_miles).toBeDefined();
        if (loc.distance_to_airport_miles) {
          expect(loc.distance_to_airport_miles).toBeGreaterThan(0);
          expect(loc.distance_to_airport_miles).toBeLessThan(10);
        }
      });

      // Real ParkWhiz should return actual data or handle gracefully
      expect(parkwhizLocations.length).toBeGreaterThanOrEqual(0);
      // Mock CAP service should return data for LAX
      expect(capLocations.length).toBeGreaterThan(0);

      console.log(
        `Real test results: ${results.locations.length} total locations, ${results.matches.length} matches`
      );
      console.log(`  - SpotHero (REAL): ${spotheroLocations.length} locations`);
      console.log(`  - ParkWhiz (REAL): ${parkwhizLocations.length} locations`);
      console.log(`  - CAP (MOCK): ${capLocations.length} locations`);
    });

    it("should handle real API failures gracefully", async () => {
      const searchParams = {
        airport_code: "INVALID_CODE",
        start_time: "2025-10-20T10:00:00",
        end_time: "2025-10-22T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      // Should still get results from mock providers even if real APIs fail
      expect(results).toBeDefined();
      expect(results.locations).toBeDefined();

      // All providers should return empty for invalid codes
      expect(results.locations.length).toBe(0);
    });

    it("should demonstrate real vs mock provider behavior", async () => {
      const searchParams = {
        airport_code: "ORD",
        start_time: "2025-10-20T10:00:00",
        end_time: "2025-10-22T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      const parkwhizCount = results.locations.filter(
        (l) => l.provider === ParkingProviderType.PARKWHIZ
      ).length;
      const spotheroCount = results.locations.filter(
        (l) => l.provider === ParkingProviderType.SPOTHERO
      ).length;
      const capCount = results.locations.filter(
        (l) => l.provider === ParkingProviderType.CHEAP_AIRPORT_PARKING
      ).length;

      console.log("Provider results breakdown:");
      console.log(`- ParkWhiz (REAL): ${parkwhizCount} locations`);
      console.log(`- SpotHero (REAL): ${spotheroCount} locations`);
      console.log(`- CAP (MOCK): ${capCount} locations`);

      expect(results.summary.providers_count).toBe(3);

      // Real SpotHero should return actual ORD data (~34 locations as of Oct 2025)
      expect(spotheroCount).toBeGreaterThan(20);

      // Verify some SpotHero locations have expected characteristics
      const spotheroLocations = results.locations.filter(
        (l) => l.provider === ParkingProviderType.SPOTHERO
      );

      // Check that we have variety in location types
      const withShuttle = spotheroLocations.filter(
        (l) => l.shuttle_service
      ).length;
      const withValet = spotheroLocations.filter((l) => l.valet_service).length;
      const covered = spotheroLocations.filter((l) => l.covered_parking).length;

      console.log(
        `SpotHero amenities: ${withShuttle} with shuttle, ${withValet} with valet, ${covered} covered`
      );

      expect(withShuttle).toBeGreaterThan(10); // Most ORD locations have shuttle
      expect(results.locations.length).toBeGreaterThan(20);
    });
  });
});
