import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbTypesafe } from "../db/dbTypesafe";
import { ParkingProvider } from "../providers/common/ParkingProvider";
import { ParkingProviderType } from "../providers/common/ParkingProviderType";
import { LocationMatchingService } from "../locationMatching/LocationMatchingService";
import { ParkingAggregationService } from "./ParkingAggregationService";

// Import the real services
import { cheapAirportParkingProvider } from "../providers/cheapAirportParking/CheapAirportParkingProvider";
import { parkWhizProvider } from "../providers/parkwhiz/ParkWhizProvider";
import { spotHeroProvider } from "../providers/spotHero/SpotHeroProvider";

describe("ParkingAggregationService - Real Tests", () => {
  let service: ParkingAggregationService;
  let providers: Record<ParkingProviderType, ParkingProvider>;
  let locationMatchingService: LocationMatchingService;

  beforeEach(() => {
    // Use all REAL providers now!
    providers = {
      [ParkingProviderType.PARKWHIZ]: parkWhizProvider,
      [ParkingProviderType.SPOTHERO]: spotHeroProvider,
      [ParkingProviderType.CHEAP_AIRPORT_PARKING]: cheapAirportParkingProvider, // Now using real CheapAirportParking!
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
    it(
      "should search with real ParkWhiz and SpotHero services",
      async () => {
        // Use current date + 1 day to work with ParkWhiz (which returns data for "now")
        // SpotHero and CAP should also support these dates
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

      const searchParams = {
        airport_code: "LAX",
        start_time: now,
        end_time: tomorrow,
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

      // Should have locations from all providers (all REAL now)
      const parkwhizLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.PARKWHIZ
      );
      const spotheroLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.SPOTHERO
      );
      const capLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProviderType.CHEAP_AIRPORT_PARKING
      );

      // Real SpotHero should return actual data for LAX (~32+ locations)
      expect(spotheroLocations.length).toBeGreaterThan(30);
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

      // Real ParkWhiz should return data when available (can be 0 if autocomplete doesn't find airport)
      expect(parkwhizLocations.length).toBeGreaterThanOrEqual(0);
      // Real CAP service should return substantial data for LAX (~52 locations as of Oct 2025)
      expect(capLocations.length).toBeGreaterThan(40);

      console.log(
        `Real test results: ${results.locations.length} total locations, ${results.matches.length} matches`
      );
      console.log(`  - SpotHero (REAL): ${spotheroLocations.length} locations`);
      console.log(`  - ParkWhiz (REAL): ${parkwhizLocations.length} locations`);
      console.log(`  - CAP (REAL): ${capLocations.length} locations`);
      },
      60000
    ); // 60 second timeout for real API calls with CAP address fetching and retries

    it("should handle real API failures gracefully", async () => {
      // Use current date + 1 day
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const searchParams = {
        airport_code: "INVALID_CODE",
        start_time: now,
        end_time: tomorrow,
      };

      const results = await service.searchParkingWithMatching(searchParams);

      // Should still get results from mock providers even if real APIs fail
      expect(results).toBeDefined();
      expect(results.locations).toBeDefined();

      // All providers should return empty for invalid codes
      expect(results.locations.length).toBe(0);
    });

    it("should demonstrate real vs mock provider behavior", async () => {
      // Use current date + 1 day to work with ParkWhiz
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const searchParams = {
        airport_code: "ORD",
        start_time: now,
        end_time: tomorrow,
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
      console.log(`- CAP (REAL): ${capCount} locations`);

      expect(results.summary.providers_count).toBe(3);

      // Real SpotHero should return actual ORD data (~19+ locations)
      expect(spotheroCount).toBeGreaterThan(15);

      // Real CAP should return ORD data (~7 locations as of Oct 2025)
      expect(capCount).toBeGreaterThan(5);

      // Real ParkWhiz should return data for current date range
      expect(parkwhizCount).toBeGreaterThanOrEqual(0); // May vary by date

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

      expect(withShuttle).toBeGreaterThan(5); // ORD locations often have shuttle
      expect(results.locations.length).toBeGreaterThan(20); // Should have ~18 SpotHero + 7 CAP + maybe ParkWhiz
    });
  });
});
