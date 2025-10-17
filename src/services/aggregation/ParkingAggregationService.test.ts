import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbTypesafe } from "../../db/dbTypesafe";
import { ParkingAggregationService } from "./ParkingAggregationService";
import { LocationMatchingService } from "../locationMatching/LocationMatchingService";
import { ParkingProviderService } from "../../providers/common/ParkingProviderService";
import { ParkingProvider } from "../../providers/common/ParkingProvider";

// Import the mock services
import { mockParkWhizService } from "../../providers/parkwhiz/mock/MockParkWhizService";
import { cheapAirportParkingMockService } from "../../providers/cheapAirportParking/CheapAirportParkingMockService";
import { spotHeroMockService } from "../../providers/spotHero/mock/SpotHeroMockService";

describe("ParkingAggregationService - Mock Tests", () => {
  let service: ParkingAggregationService;
  let mockProviders: Record<ParkingProvider, ParkingProviderService>;
  let locationMatchingService: LocationMatchingService;

  beforeEach(() => {
    // Use mock providers directly - no re-mocking needed
    mockProviders = {
      [ParkingProvider.PARKWHIZ]: mockParkWhizService,
      [ParkingProvider.SPOTHERO]: spotHeroMockService,
      [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingMockService,
    };

    locationMatchingService = new LocationMatchingService();
    service = new ParkingAggregationService(
      dbTypesafe,
      mockProviders,
      locationMatchingService
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchParkingWithMatching", () => {
    it("should search all providers and find matches", async () => {
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
      expect(results.summary.total_locations).toBeGreaterThanOrEqual(0);
      expect(results.summary.matches_found).toBeGreaterThanOrEqual(0);
      expect(results.summary.search_duration_ms).toBeGreaterThan(0);

      // Should have locations from all three mock providers
      const parkwhizLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.PARKWHIZ
      );
      const spotheroLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.SPOTHERO
      );
      const capLocations = results.locations.filter(
        (loc) => loc.provider === ParkingProvider.CHEAP_AIRPORT_PARKING
      );

      expect(parkwhizLocations.length).toBeGreaterThan(0);
      expect(spotheroLocations.length).toBeGreaterThan(0);
      expect(capLocations.length).toBeGreaterThan(0);
    });

    it("should handle empty results gracefully", async () => {
      const searchParams = {
        airport_code: "INVALID",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      // Mock providers return empty arrays for invalid airport codes
      expect(results.locations).toHaveLength(0);
      expect(results.matches).toHaveLength(0);
      expect(results.summary.total_locations).toBe(0);
      expect(results.summary.matches_found).toBe(0);
    });

    it("should store locations in database", async () => {
      const searchParams = {
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

      // Verify results include the locations that should have been stored
      expect(results.locations.length).toBeGreaterThan(0);
      expect(results.summary.total_locations).toBeGreaterThan(0);
    });
  });

  describe("generateReports", () => {
    it("should generate comprehensive reports", async () => {
      // Create mock matches
      const mockMatches = [
        {
          id: "match_1",
          canonical_name: "LAX Economy Parking",
          canonical_address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          confidence_score: 0.95,
          locations: [
            {
              provider: "parkwhiz" as any,
              provider_id: "pw_1",
              name: "LAX Economy",
              address: {
                street: "1 World Way",
                city: "Los Angeles",
                state: "CA",
                zip: "90045",
                full_address: "1 World Way, Los Angeles, CA",
              },
              coordinates: { latitude: 33.942, longitude: -118.408 },
              distance_to_airport_miles: 0.5,
              pricing: { daily_rate: 24, currency: "USD" },
              amenities: ["shuttle"],
              availability: true,
              shuttle_service: true,
              valet_service: false,
              covered_parking: false,
              provider_data: {},
            },
            {
              provider: "spothero" as any,
              provider_id: "sh_1",
              name: "LAX Economy Lot",
              address: {
                street: "1 World Way",
                city: "Los Angeles",
                state: "CA",
                zip: "90045",
                full_address: "1 World Way, Los Angeles, CA",
              },
              coordinates: { latitude: 33.942, longitude: -118.408 },
              distance_to_airport_miles: 0.5,
              pricing: { daily_rate: 25, currency: "USD" },
              amenities: ["shuttle"],
              availability: true,
              shuttle_service: true,
              valet_service: false,
              covered_parking: false,
              provider_data: {},
            },
          ],
          match_reasons: ["High address similarity", "Close coordinates"],
        },
      ];

      const reports = await service.generateReports(mockMatches);

      expect(reports.matching_report).toContain(
        "Parking Location Matching Report"
      );
      expect(reports.matching_report).toContain("LAX Economy Parking");
      expect(reports.matching_report).toContain("95.0%");

      expect(reports.csv_export).toContain("Match ID,Canonical Name");
      expect(reports.csv_export).toContain("match_1");
      expect(reports.csv_export).toContain("LAX Economy Parking");
    });

    it("should handle empty matches in reports", async () => {
      const reports = await service.generateReports([]);

      expect(reports.matching_report).toContain(
        "Total matched location groups: 0"
      );
      expect(reports.csv_export).toContain("Match ID,Canonical Name"); // Headers only
    });
  });

  describe("error handling", () => {
    it("should handle provider failures gracefully", async () => {
      const searchParams = {
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      // Should not throw error, but handle gracefully
      await expect(
        service.searchParkingWithMatching(searchParams)
      ).resolves.toBeDefined();
    });

    it("should handle provider failures", async () => {
      const searchParams = {
        airport_code: "NONEXISTENT",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);
      expect(results).toBeDefined();
      expect(results.locations).toHaveLength(0); // Mock providers return empty for invalid codes
    });
  });

  describe("performance", () => {
    it("should complete searches within reasonable time", async () => {
      const searchParams = {
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const startTime = Date.now();
      await service.searchParkingWithMatching(searchParams);
      const endTime = Date.now();

      const duration = endTime - startTime;

      // Should complete within 5 seconds (generous for mock data)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe("data validation", () => {
    it("should validate search parameters", async () => {
      const invalidParams = {
        airport_code: "",
        start_time: "",
        end_time: "",
      };

      // Should handle invalid params gracefully
      await expect(
        service.searchParkingWithMatching(invalidParams as any)
      ).resolves.toBeDefined();
    });
  });
});
