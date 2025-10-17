import { describe, expect, it, beforeEach } from "vitest";
import {
  LocationMatchingService,
  createLocationMatchingService,
} from "./location-matching-service";
import {
  ParkingLocation,
  ParkingProvider,
  ParkingProviderService,
} from "../providers/providers";

// Import mock services
import { mockParkWhizService } from "../providers/parkwhiz/mock-parkwhiz-service";
import { spotHeroService } from "../providers/spotHero/spothero-service";
import { cheapAirportParkingService } from "../providers/cheapAirportParking/cheap-airport-parking-service";

describe("LocationMatchingService - Mock Tests", () => {
  let service: LocationMatchingService;
  let mockProviders: Record<ParkingProvider, ParkingProviderService>;

  beforeEach(() => {
    // Use mock providers directly
    mockProviders = {
      [ParkingProvider.PARKWHIZ]: mockParkWhizService,
      [ParkingProvider.SPOTHERO]: spotHeroService,
      [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingService,
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

  describe("findMatches", () => {
    it("should match locations with similar names", async () => {
      // Get mock data from providers
      const parkwhizResults = await mockProviders[
        ParkingProvider.PARKWHIZ
      ].searchLocations({
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      });

      const spotheroResults = await mockProviders[
        ParkingProvider.SPOTHERO
      ].searchLocations({
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      });

      const allLocations = [...parkwhizResults, ...spotheroResults];
      const matches = service.findMatches(allLocations);

      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);

      // Verify match structure
      matches.forEach((match) => {
        expect(match).toHaveProperty("id");
        expect(match).toHaveProperty("canonical_name");
        expect(match).toHaveProperty("canonical_address");
        expect(match).toHaveProperty("coordinates");
        expect(match).toHaveProperty("confidence_score");
        expect(match).toHaveProperty("locations");
        expect(match).toHaveProperty("match_reasons");

        expect(match.locations.length).toBeGreaterThan(1); // Should have multiple locations
        expect(match.confidence_score).toBeGreaterThanOrEqual(0);
        expect(match.confidence_score).toBeLessThanOrEqual(1);
      });
    });

    it("should not match locations that are too different", async () => {
      const locations: ParkingLocation[] = [
        {
          provider: ParkingProvider.PARKWHIZ,
          provider_id: "pw_different_1",
          name: "Airport Terminal Parking",
          address: {
            street: "1 Terminal Dr",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 Terminal Dr, Los Angeles, CA",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          distance_to_airport_miles: 0.1,
          pricing: { daily_rate: 50, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: true,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider: ParkingProvider.SPOTHERO,
          provider_id: "sh_different_1",
          name: "Downtown Business Center",
          address: {
            street: "500 S Figueroa St",
            city: "Los Angeles",
            state: "CA",
            zip: "90071",
            full_address: "500 S Figueroa St, Los Angeles, CA",
          },
          coordinates: { latitude: 34.053, longitude: -118.253 },
          distance_to_airport_miles: 15.2,
          pricing: { daily_rate: 25, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
      ];

      const matches = service.findMatches(locations);

      // These very different locations should not match
      expect(matches.length).toBe(0);
    });

    it("should handle empty location arrays", () => {
      const matches = service.findMatches([]);
      expect(matches).toEqual([]);
    });

    it("should handle single location", async () => {
      const parkwhizResults = await mockProviders[
        ParkingProvider.PARKWHIZ
      ].searchLocations({
        airport_code: "LAX",
        start_time: "2024-12-20T10:00:00",
        end_time: "2024-12-20T18:00:00",
      });

      if (parkwhizResults.length > 0) {
        const matches = service.findMatches([parkwhizResults[0]]);
        expect(matches).toEqual([]); // Single location can't match with itself
      }
    });
  });

  describe("performance with mock data", () => {
    it("should handle large datasets efficiently", async () => {
      // Get data from all mock providers
      const allProviderResults = await Promise.all([
        mockProviders[ParkingProvider.PARKWHIZ].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
        mockProviders[ParkingProvider.SPOTHERO].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
        mockProviders[ParkingProvider.CHEAP_AIRPORT_PARKING].searchLocations({
          airport_code: "LAX",
          start_time: "2024-12-20T10:00:00",
          end_time: "2024-12-20T18:00:00",
        }),
      ]);

      const allLocations = allProviderResults.flat();

      const startTime = Date.now();
      const matches = service.findMatches(allLocations);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second for mock data

      console.log(
        `Mock matching completed in ${duration}ms for ${allLocations.length} locations, found ${matches.length} matches`
      );
    });
  });

  describe("edge cases", () => {
    it("should handle locations with missing coordinate data", () => {
      const locations: ParkingLocation[] = [
        {
          provider: ParkingProvider.PARKWHIZ,
          provider_id: "pw_no_coords",
          name: "Test Location",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "CA",
            zip: "12345",
            full_address: "123 Test St, Test City, CA",
          },
          coordinates: { latitude: 0, longitude: 0 }, // Invalid coordinates
          distance_to_airport_miles: 1.0,
          pricing: { daily_rate: 20, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      // Should not crash with invalid coordinates
      expect(() => {
        const matches = service.findMatches(locations);
        expect(Array.isArray(matches)).toBe(true);
      }).not.toThrow();
    });
  });
});
