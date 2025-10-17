import { describe, expect, it, beforeEach } from "vitest";
import {
  LocationMatchingService,
  createLocationMatchingService,
} from "./location-matching-service";
import {
  ParkingLocation,
  ParkingProvider,
  ParkingProviderService,
} from "../../providers/providers";

// Import real and mock services
import { realParkWhizService } from "../../providers/parkwhiz/real-parkwhiz-service";
import { spotHeroService } from "../../providers/spotHero/spothero-service";
import { cheapAirportParkingService } from "../../providers/cheapAirportParking/cheap-airport-parking-service";

describe("LocationMatchingService - Real Tests", () => {
  let service: LocationMatchingService;
  let providers: Record<ParkingProvider, ParkingProviderService>;

  beforeEach(() => {
    // Use real ParkWhiz service + mock services for the others
    providers = {
      [ParkingProvider.PARKWHIZ]: realParkWhizService,
      [ParkingProvider.SPOTHERO]: spotHeroService, // Still mock for now
      [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingService, // Still mock for now
    };

    service = createLocationMatchingService({
      minimum_name_similarity: 0.4,
      strong_name_similarity: 0.8,
      minimum_address_similarity: 0.75,
      strong_address_similarity: 0.95,
      maximum_distance_meters: 150,
      same_location_distance_meters: 30,
      maximum_price_difference_ratio: 0.4,
      consider_price_in_matching: true,
      base_confidence_score: 0.3,
      provider_count_bonus: 0.2,
      coordinate_data_bonus: 0.1,
      complete_address_bonus: 0.05,
      same_address_bonus: 0.25,
      minimum_match_confidence: 0.7,
      excellent_match_threshold: 0.9,
    });
  });

  describe("findMatches - Real Integration", () => {
    it("should match locations with real ParkWhiz and mock providers", async () => {
      // Get data from all providers (real ParkWhiz + mock others)
      const allProviderResults = await Promise.all([
        providers[ParkingProvider.PARKWHIZ].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
        providers[ParkingProvider.SPOTHERO].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
        providers[ParkingProvider.CHEAP_AIRPORT_PARKING].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
      ]);

      const allLocations = allProviderResults.flat();
      const matches = service.findMatches(allLocations);

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);

      console.log(
        `Real test: Found ${matches.length} matches across ${allLocations.length} total locations`
      );
      console.log(`Provider breakdown:`);
      console.log(
        `- ParkWhiz (REAL): ${allProviderResults[0].length} locations`
      );
      console.log(
        `- SpotHero (MOCK): ${allProviderResults[1].length} locations`
      );
      console.log(`- CAP (MOCK): ${allProviderResults[2].length} locations`);

      // Verify match structure
      matches.forEach((match) => {
        expect(match).toHaveProperty("id");
        expect(match).toHaveProperty("canonical_name");
        expect(match).toHaveProperty("canonical_address");
        expect(match).toHaveProperty("confidence_score");
        expect(match).toHaveProperty("locations");
        expect(match).toHaveProperty("match_reasons");

        expect(match.locations.length).toBeGreaterThan(1);
        expect(match.confidence_score).toBeGreaterThanOrEqual(0);
        expect(match.confidence_score).toBeLessThanOrEqual(1);
      });
    });

    it("should handle mixed real and mock data gracefully", async () => {
      const parkwhizResults = await providers[
        ParkingProvider.PARKWHIZ
      ].searchLocations({
        airport_code: "ORD",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      });

      const spotheroResults = await providers[
        ParkingProvider.SPOTHERO
      ].searchLocations({
        airport_code: "ORD",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      });

      const allLocations = [...parkwhizResults, ...spotheroResults];
      const matches = service.findMatches(allLocations);

      expect(Array.isArray(matches)).toBe(true);

      console.log(
        `ORD test: ${parkwhizResults.length} real ParkWhiz + ${spotheroResults.length} mock SpotHero = ${matches.length} matches`
      );

      // Should handle the combination gracefully
      if (matches.length > 0) {
        matches.forEach((match) => {
          expect(match.locations.length).toBeGreaterThan(1);
          expect(match.confidence_score).toBeGreaterThan(0);

          // Should contain locations from different providers
          const providers = new Set(match.locations.map((loc) => loc.provider));
          expect(providers.size).toBeGreaterThan(1);
        });
      }
    });

    it("should generate matching reports with real data", async () => {
      // Use LAX which typically has more data
      const allProviderResults = await Promise.all([
        providers[ParkingProvider.PARKWHIZ].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
        providers[ParkingProvider.SPOTHERO].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
      ]);

      const allLocations = allProviderResults.flat();
      const matches = service.findMatches(allLocations);

      if (matches.length > 0) {
        const report = service.generateMatchingReport(matches);

        expect(typeof report).toBe("string");
        expect(report).toContain("Parking Location Matching Report");
        expect(report).toContain("Total matched location groups");
        expect(report.length).toBeGreaterThan(100); // Should be a substantial report

        console.log("Generated matching report successfully");
        console.log(`Report length: ${report.length} characters`);
      } else {
        console.log("No matches found for report generation test");
      }
    });

    it("should handle empty results gracefully", async () => {
      // Test with a real but uncommon airport that might return fewer results
      const results = await providers[ParkingProvider.PARKWHIZ].searchLocations(
        {
          airport_code: "BUR", // Burbank airport - smaller, may have fewer results
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }
      );

      // Should not crash, regardless of number of results
      const matches = service.findMatches(results);
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });
});
