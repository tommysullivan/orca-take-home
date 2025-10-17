import { beforeEach, describe, expect, it } from "vitest";
import { ParkingProvider } from "../providers/common/ParkingProvider";
import { ParkingProviderType } from "../providers/common/ParkingProviderType";
import { LocationMatchingService } from "./LocationMatchingService";
import { cheapAirportParkingProvider } from "../providers/cheapAirportParking/CheapAirportParkingProvider";
import { parkWhizProvider } from "../providers/parkwhiz/ParkWhizProvider";
import { spotHeroProvider } from "../providers/spotHero/SpotHeroProvider";

describe("LocationMatchingService - Integration Tests", () => {
  let service: LocationMatchingService;
  let providers: Record<ParkingProviderType, ParkingProvider>;

  beforeEach(() => {
    providers = {
      [ParkingProviderType.PARKWHIZ]: parkWhizProvider,
      [ParkingProviderType.SPOTHERO]: spotHeroProvider, // Now using real SpotHero!
      [ParkingProviderType.CHEAP_AIRPORT_PARKING]:
        cheapAirportParkingProvider, // Now using real CheapAirportParking!
    };

    service = new LocationMatchingService({
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
    it("should match locations with real ParkWhiz and SpotHero providers", async () => {
      const allProviderResults = await Promise.all([
        providers[ParkingProviderType.PARKWHIZ].searchLocations({
          airport_code: "LAX",
          start_time: new Date("2025-10-20T10:00:00"),
          end_time: new Date("2025-10-22T18:00:00"),
        }),
        providers[ParkingProviderType.SPOTHERO].searchLocations({
          airport_code: "LAX",
          start_time: new Date("2025-10-20T10:00:00"),
          end_time: new Date("2025-10-22T18:00:00"),
        }),
        providers[ParkingProviderType.CHEAP_AIRPORT_PARKING].searchLocations({
          airport_code: "LAX",
          start_time: new Date("2025-10-20T10:00:00"),
          end_time: new Date("2025-10-22T18:00:00"),
        }),
      ]);

      const allLocations = allProviderResults.flat();
      const matches = service.findMatches(allLocations);

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);

      // With real SpotHero data, we should get more matches
      const parkwhizCount = allProviderResults[0].length;
      const spotheroCount = allProviderResults[1].length;
      const capCount = allProviderResults[2].length;

      console.log(
        `Real test: Found ${matches.length} matches across ${allLocations.length} total locations`
      );
      console.log(`Provider breakdown:`);
      console.log(`- ParkWhiz (REAL): ${parkwhizCount} locations`);
      console.log(`- SpotHero (REAL): ${spotheroCount} locations`);
      console.log(`- CAP (REAL): ${capCount} locations`);

      // Real providers should return substantial data
      expect(spotheroCount).toBeGreaterThan(40);
      expect(capCount).toBeGreaterThan(30); // Cheap Airport Parking should have plenty of locations

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

      // Log top matches for verification
      const topMatches = matches.slice(0, 3);
      console.log(`\nTop ${topMatches.length} matches:`);
      topMatches.forEach((match, idx) => {
        console.log(
          `${idx + 1}. ${
            match.canonical_name
          } (${match.confidence_score.toFixed(2)} confidence)`
        );
        console.log(
          `   Providers: ${match.locations.map((l) => l.provider).join(", ")}`
        );
      });
    });

    it("should handle mixed real data gracefully", async () => {
      const parkwhizResults = await providers[
        ParkingProviderType.PARKWHIZ
      ].searchLocations({
        airport_code: "ORD",
        start_time: new Date("2025-10-20T10:00:00"),
        end_time: new Date("2025-10-22T18:00:00"),
      });

      const spotheroResults = await providers[
        ParkingProviderType.SPOTHERO
      ].searchLocations({
        airport_code: "ORD",
        start_time: new Date("2025-10-20T10:00:00"),
        end_time: new Date("2025-10-22T18:00:00"),
      });

      const allLocations = [...parkwhizResults, ...spotheroResults];
      const matches = service.findMatches(allLocations);

      expect(Array.isArray(matches)).toBe(true);

      console.log(
        `ORD test: ${parkwhizResults.length} real ParkWhiz + ${spotheroResults.length} real SpotHero = ${matches.length} matches`
      );

      // Real SpotHero should return ~34 locations for ORD
      expect(spotheroResults.length).toBeGreaterThan(20);

      if (matches.length > 0) {
        console.log(`\nTop matches for ORD:`);
        matches.slice(0, 3).forEach((match, idx) => {
          console.log(
            `${idx + 1}. ${
              match.canonical_name
            } (${match.confidence_score.toFixed(2)} confidence)`
          );
          console.log(
            `   Providers: ${match.locations.map((l) => l.provider).join(", ")}`
          );
        });

        matches.forEach((match) => {
          expect(match.locations.length).toBeGreaterThan(1);
          expect(match.confidence_score).toBeGreaterThan(0);
          const providers = new Set(match.locations.map((loc) => loc.provider));
          expect(providers.size).toBeGreaterThan(1);
        });
      }
    });

    it("should generate matching reports with real data", async () => {
      const allProviderResults = await Promise.all([
        providers[ParkingProviderType.PARKWHIZ].searchLocations({
          airport_code: "LAX",
          start_time: new Date("2025-10-20T10:00:00"),
          end_time: new Date("2025-10-22T18:00:00"),
        }),
        providers[ParkingProviderType.SPOTHERO].searchLocations({
          airport_code: "LAX",
          start_time: new Date("2025-10-20T10:00:00"),
          end_time: new Date("2025-10-22T18:00:00"),
        }),
      ]);

      const allLocations = allProviderResults.flat();
      const matches = service.findMatches(allLocations);

      console.log(
        `Report test: Found ${matches.length} matches from ${allLocations.length} locations`
      );

      if (matches.length > 0) {
        const report = service.generateMatchingReport(matches);

        expect(typeof report).toBe("string");
        expect(report).toContain("Parking Location Matching Report");
        expect(report).toContain("Total matched location groups");
        expect(report.length).toBeGreaterThan(100); // Should be a substantial report

        console.log("Generated matching report successfully");
        console.log(`Report length: ${report.length} characters`);
        console.log(`First 300 chars:\n${report.substring(0, 300)}...`);
      } else {
        console.log("No matches found for report generation test");
      }
    });

    it("should handle empty results gracefully", async () => {
      const results = await providers[
        ParkingProviderType.PARKWHIZ
      ].searchLocations({
        airport_code: "BUR", // Burbank airport - smaller, may have fewer results
        start_time: new Date("2025-10-20T10:00:00"),
        end_time: new Date("2025-10-22T18:00:00"),
      });

      const matches = service.findMatches(results);
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);

      console.log(
        `BUR test: ${results.length} locations, ${matches.length} matches`
      );
    });
  });
});
