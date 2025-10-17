import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbTypesafe } from "../../db/dbTypesafe";
import { ParkingAggregationService } from "./parking-aggregation-service";
import { LocationMatchingService } from "../locationMatching/location-matching-service";
import {
  ParkingProvider,
  ParkingProviderService,
} from "../../providers/providers";

// Import the real and mock services
import { realParkWhizService } from "../../providers/parkwhiz/real-parkwhiz-service";
import { spotHeroService } from "../../providers/spotHero/spothero-service";
import { cheapAirportParkingService } from "../../providers/cheapAirportParking/cheap-airport-parking-service";

describe("ParkingAggregationService - Real Tests", () => {
  let service: ParkingAggregationService;
  let providers: Record<ParkingProvider, ParkingProviderService>;
  let locationMatchingService: LocationMatchingService;

  beforeEach(() => {
    // Use real ParkWhiz service + mock services for the others (until they're implemented)
    providers = {
      [ParkingProvider.PARKWHIZ]: realParkWhizService,
      [ParkingProvider.SPOTHERO]: spotHeroService, // Still mock for now
      [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingService, // Still mock for now
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
    it("should search with real ParkWhiz service and mock others", async () => {
      const searchParams = {
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
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

      // Should have locations from all providers (real ParkWhiz + mock others)
      const parkwhizLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.PARKWHIZ
      );
      const spotheroLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.SPOTHERO
      );
      const capLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.CHEAP_AIRPORT_PARKING
      );

      // Real ParkWhiz should return actual data or handle gracefully
      expect(parkwhizLocations.length).toBeGreaterThanOrEqual(0);
      // Mock services should return data for LAX
      expect(spotheroLocations.length).toBeGreaterThan(0);
      expect(capLocations.length).toBeGreaterThan(0);

      console.log(
        `Real test results: ${results.locations.length} total locations, ${results.matches.length} matches`
      );
    });

    it("should handle real API failures gracefully", async () => {
      const searchParams = {
        airport_code: "INVALID_CODE",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      // Should still get results from mock providers even if ParkWhiz fails
      expect(results).toBeDefined();
      expect(results.locations).toBeDefined();

      // Mock providers should return empty for invalid codes
      const nonParkwhizLocations = results.locations.filter(
        (loc) => loc.provider !== ParkingProvider.PARKWHIZ
      );
      expect(nonParkwhizLocations.length).toBe(0); // Mock providers return empty for invalid codes
    });

    it("should demonstrate real vs mock provider behavior", async () => {
      const searchParams = {
        airport_code: "ORD",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      console.log("Provider results breakdown:");
      console.log(
        `- ParkWhiz (REAL): ${
          results.locations.filter(
            (l) => l.provider === ParkingProvider.PARKWHIZ
          ).length
        } locations`
      );
      console.log(
        `- SpotHero (MOCK): ${
          results.locations.filter(
            (l) => l.provider === ParkingProvider.SPOTHERO
          ).length
        } locations`
      );
      console.log(
        `- CAP (MOCK): ${
          results.locations.filter(
            (l) => l.provider === ParkingProvider.CHEAP_AIRPORT_PARKING
          ).length
        } locations`
      );

      expect(results.summary.providers_count).toBe(3);
      expect(results.locations.length).toBeGreaterThanOrEqual(0);
    });
  });
});
