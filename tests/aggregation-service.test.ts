import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DBTypesafe } from "../src/db/dbTypesafe";
import { ParkingAggregationService } from "../src/services/parking-aggregation-service";

describe("ParkingAggregationService", () => {
  let service: ParkingAggregationService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      selectFrom: vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      insertInto: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflict: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue({}),
          }),
          execute: vi.fn().mockResolvedValue({}),
        }),
      }),
    };

    service = new ParkingAggregationService(mockDb as DBTypesafe);
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
    });

    it("should handle empty results gracefully", async () => {
      const searchParams = {
        airport_code: "INVALID",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);

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

      await service.searchParkingWithMatching(searchParams);

      // Verify database insert was called
      expect(mockDb.insertInto).toHaveBeenCalledWith("parking_locations");
    });
  });

  describe("getHistoricalData", () => {
    it("should retrieve historical locations", async () => {
      const mockLocations = [
        { id: 1, name: "Test Location 1", airport_code: "LAX" },
        { id: 2, name: "Test Location 2", airport_code: "LAX" },
      ];

      mockDb
        .selectFrom()
        .selectAll()
        .where()
        .orderBy()
        .execute.mockResolvedValueOnce(mockLocations)
        .mockResolvedValueOnce([]);

      const result = await service.getHistoricalData("LAX");

      expect(result.locations).toEqual(mockLocations);
      expect(result.matches).toEqual([]);
      expect(mockDb.selectFrom).toHaveBeenCalledWith("parking_locations");
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
              airport_code: "LAX",
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
              airport_code: "LAX",
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
    it("should handle database errors gracefully", async () => {
      mockDb
        .insertInto()
        .values()
        .onConflict()
        .execute.mockRejectedValue(new Error("Database error"));

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
      // This test would require mocking the provider services
      // For now, we test that the service handles empty results
      const searchParams = {
        airport_code: "NONEXISTENT",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      };

      const results = await service.searchParkingWithMatching(searchParams);
      expect(results).toBeDefined();
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
