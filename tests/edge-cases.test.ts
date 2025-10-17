import { describe, it, expect } from "vitest";
import { LocationMatchingService } from "../src/services/locationMatching/location-matching-service";
import { ParkingLocation, ParkingProvider } from "../src/providers/providers";

/**
 * Edge Case Tests: Devil's Advocate Scenarios
 *
 * These tests are designed to break our matching algorithm with realistic edge cases
 * that could occur with real-world parking provider data.
 */
describe("LocationMatchingService - Edge Cases & Devil's Advocate", () => {
  describe("Airport Code Position Variations", () => {
    it("should match when airport code appears at different positions in name", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_001",
          provider: ParkingProvider.PARKWHIZ,
          name: "LAX Official Economy Lot",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.5,
          pricing: { daily_rate: 25, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_001",
          provider: ParkingProvider.SPOTHERO,
          name: "Official Economy Lot LAX", // Airport code at end
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.5,
          pricing: { daily_rate: 26, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "cap_001",
          provider: ParkingProvider.CHEAP_AIRPORT_PARKING,
          name: "Economy LAX Airport Parking", // Airport code in middle
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.5,
          pricing: { daily_rate: 24, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(3);
    });
  });

  describe("Brand Name Variations", () => {
    it("should fail to match different brands at same location (too aggressive matching)", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_brand1",
          provider: ParkingProvider.PARKWHIZ,
          name: "Marriott LAX Hotel Parking",
          address: {
            street: "5855 W Century Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "5855 W Century Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9425, longitude: -118.3781 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.2,
          pricing: { daily_rate: 35, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_brand2",
          provider: ParkingProvider.SPOTHERO,
          name: "Hilton LAX Hotel Parking", // Different hotel brand, same area
          address: {
            street: "5711 W Century Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "5711 W Century Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9426, longitude: -118.3782 }, // Very close coordinates
          airport_code: "LAX",
          distance_to_airport_miles: 1.2,
          pricing: { daily_rate: 34, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // These should NOT match - different hotel brands despite similar location
      expect(matches).toHaveLength(0);
    });
  });

  describe("Address Normalization Edge Cases", () => {
    it("should handle abbreviation mismatches that break matching", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_abbr1",
          provider: ParkingProvider.PARKWHIZ,
          name: "Airport Center Parking",
          address: {
            street: "123 North Century Boulevard",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "123 North Century Boulevard, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9425, longitude: -118.3781 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.0,
          pricing: { daily_rate: 22, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_abbr2",
          provider: ParkingProvider.SPOTHERO,
          name: "Airport Center Parking",
          address: {
            street: "123 N Century Blvd", // Heavy abbreviation
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "123 N Century Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9425, longitude: -118.3781 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.0,
          pricing: { daily_rate: 23, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // This SHOULD match but might fail due to address normalization issues
      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(2);
    });
  });

  describe("Coordinate Drift Issues", () => {
    it("should handle GPS coordinate drift that prevents matching", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_drift1",
          provider: ParkingProvider.PARKWHIZ,
          name: "Terminal 1 Parking Structure",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942536, longitude: -118.408075 }, // Precise GPS
          airport_code: "LAX",
          distance_to_airport_miles: 0.2,
          pricing: { daily_rate: 30, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider_id: "sh_drift2",
          provider: ParkingProvider.SPOTHERO,
          name: "Terminal 1 Parking Structure",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.943, longitude: -118.4085 }, // Slightly different due to GPS drift
          airport_code: "LAX",
          distance_to_airport_miles: 0.2,
          pricing: { daily_rate: 31, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // Should match despite slight coordinate differences
      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(2);
    });
  });

  describe("Extreme Price Variations", () => {
    it("should handle extreme price differences with price matching ON", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_price1",
          provider: ParkingProvider.PARKWHIZ,
          name: "Economy Lot A",
          address: {
            street: "1234 Airport Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1234 Airport Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.5,
          pricing: { daily_rate: 15, currency: "USD" }, // Cheap
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_price2",
          provider: ParkingProvider.SPOTHERO,
          name: "Economy Lot A",
          address: {
            street: "1234 Airport Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1234 Airport Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.5,
          pricing: { daily_rate: 45, currency: "USD" }, // 3x more expensive - surge pricing?
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcherWithPrice = new LocationMatchingService({
        minimum_name_similarity: 0.4,
        strong_name_similarity: 0.8,
        minimum_address_similarity: 0.9, // Very high for exact match
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

      const matcherWithoutPrice = new LocationMatchingService({
        minimum_name_similarity: 0.4,
        strong_name_similarity: 0.8,
        minimum_address_similarity: 0.9, // Very high for exact match
        strong_address_similarity: 0.95,
        maximum_distance_meters: 150,
        same_location_distance_meters: 30,
        maximum_price_difference_ratio: 0.4,
        consider_price_in_matching: false,
        base_confidence_score: 0.3,
        provider_count_bonus: 0.2,
        coordinate_data_bonus: 0.1,
        complete_address_bonus: 0.05,
        same_address_bonus: 0.25,
        minimum_match_confidence: 0.7,
        excellent_match_threshold: 0.9,
      });

      const matchesWithPrice = matcherWithPrice.findMatches(locations);
      const matchesWithoutPrice = matcherWithoutPrice.findMatches(locations);

      // With price consideration: should NOT match due to extreme price difference
      expect(matchesWithPrice).toHaveLength(0);

      // Without price consideration: SHOULD match based on identical addresses and names
      expect(matchesWithoutPrice).toHaveLength(1);
      expect(matchesWithoutPrice[0].locations).toHaveLength(2);
    });
  });

  describe("Missing Data Edge Cases", () => {
    it("should handle locations with missing coordinates gracefully", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_no_coords",
          provider: ParkingProvider.PARKWHIZ,
          name: "Mystery Parking Lot",
          address: {
            street: "999 Unknown St",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "999 Unknown St, Los Angeles, CA 90045",
          },
          coordinates: undefined, // Missing coordinates
          airport_code: "LAX",
          distance_to_airport_miles: 2.0,
          pricing: { daily_rate: 20, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_no_coords",
          provider: ParkingProvider.SPOTHERO,
          name: "Mystery Parking Lot",
          address: {
            street: "999 Unknown Street",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "999 Unknown Street, Los Angeles, CA 90045",
          },
          coordinates: undefined, // Missing coordinates
          airport_code: "LAX",
          distance_to_airport_miles: 2.0,
          pricing: { daily_rate: 21, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // Should still match based on name and address even without coordinates
      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(2);
    });

    it("should handle locations with partial address data", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_partial",
          provider: ParkingProvider.PARKWHIZ,
          name: "Partial Data Lot",
          address: {
            street: "123 Main St",
            city: "Los Angeles",
            state: "CA",
            zip: "", // Missing ZIP
            full_address: "123 Main St, Los Angeles, CA",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.0,
          pricing: { daily_rate: 25, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_partial",
          provider: ParkingProvider.SPOTHERO,
          name: "Partial Data Lot",
          address: {
            street: "123 Main Street",
            city: "Los Angeles",
            state: "CA",
            zip: "90045", // Has ZIP
            full_address: "123 Main Street, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.0,
          pricing: { daily_rate: 26, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(2);
    });
  });

  describe("Similar But Different Locations", () => {
    it("should NOT match similar parking lots that are actually different facilities", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_lot_a",
          provider: ParkingProvider.PARKWHIZ,
          name: "Terminal Parking Lot A",
          address: {
            street: "100 Airport Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "100 Airport Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9425, longitude: -118.408 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.8,
          pricing: { daily_rate: 28, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_lot_b",
          provider: ParkingProvider.SPOTHERO,
          name: "Terminal Parking Lot B", // Different lot
          address: {
            street: "200 Airport Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "200 Airport Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.943, longitude: -118.4085 }, // Close but different
          airport_code: "LAX",
          distance_to_airport_miles: 0.9,
          pricing: { daily_rate: 29, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // Should NOT match - these are clearly different lots (A vs B, different addresses)
      expect(matches).toHaveLength(0);
    });
  });

  describe("Real-World Ambiguous Cases", () => {
    it("should handle provider-specific naming conventions that obscure matches", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_convention1",
          provider: ParkingProvider.PARKWHIZ,
          name: "ParkWhiz - LAX Central Terminal Deck",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942536, longitude: -118.408075 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.1,
          pricing: { daily_rate: 32, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider_id: "sh_convention2",
          provider: ParkingProvider.SPOTHERO,
          name: "SpotHero Exclusive: Central Terminal Parking Deck LAX",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942536, longitude: -118.408075 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.1,
          pricing: { daily_rate: 33, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider_id: "cap_convention3",
          provider: ParkingProvider.CHEAP_AIRPORT_PARKING,
          name: "Central Terminal Deck - Discount Rate",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942536, longitude: -118.408075 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.1,
          pricing: { daily_rate: 28, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: false,
          valet_service: false,
          covered_parking: true,
          provider_data: {},
        },
      ];

      const matcher = new LocationMatchingService();
      const matches = matcher.findMatches(locations);

      // Should match despite provider branding in names
      expect(matches).toHaveLength(1);
      expect(matches[0].locations).toHaveLength(3);
    });
  });

  describe("Dynamic Pricing Edge Cases", () => {
    it("should handle surge pricing scenarios correctly", () => {
      const locations: ParkingLocation[] = [
        {
          provider_id: "pw_surge",
          provider: ParkingProvider.PARKWHIZ,
          name: "Holiday Inn Express LAX",
          address: {
            street: "9901 La Cienega Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "9901 La Cienega Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9456, longitude: -118.3876 },
          airport_code: "LAX",
          distance_to_airport_miles: 2.1,
          pricing: { daily_rate: 22, currency: "USD" }, // Normal pricing
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "sh_surge",
          provider: ParkingProvider.SPOTHERO,
          name: "Holiday Inn Express LAX",
          address: {
            street: "9901 La Cienega Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "9901 La Cienega Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9456, longitude: -118.3876 },
          airport_code: "LAX",
          distance_to_airport_miles: 2.1,
          pricing: { daily_rate: 38, currency: "USD" }, // Surge pricing (73% higher)
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matcherWithPrice = new LocationMatchingService({
        minimum_name_similarity: 0.4,
        strong_name_similarity: 0.8,
        minimum_address_similarity: 0.9, // Very high for exact match
        strong_address_similarity: 0.95,
        maximum_distance_meters: 150,
        same_location_distance_meters: 30,
        maximum_price_difference_ratio: 0.4, // 40% threshold
        consider_price_in_matching: true,
        base_confidence_score: 0.3,
        provider_count_bonus: 0.2,
        coordinate_data_bonus: 0.1,
        complete_address_bonus: 0.05,
        same_address_bonus: 0.25,
        minimum_match_confidence: 0.7,
        excellent_match_threshold: 0.9,
      });

      const matcherWithoutPrice = new LocationMatchingService({
        minimum_name_similarity: 0.4,
        strong_name_similarity: 0.8,
        minimum_address_similarity: 0.9, // Very high for exact match
        strong_address_similarity: 0.95,
        maximum_distance_meters: 150,
        same_location_distance_meters: 30,
        maximum_price_difference_ratio: 0.4,
        consider_price_in_matching: false,
        base_confidence_score: 0.3,
        provider_count_bonus: 0.2,
        coordinate_data_bonus: 0.1,
        complete_address_bonus: 0.05,
        same_address_bonus: 0.25,
        minimum_match_confidence: 0.7,
        excellent_match_threshold: 0.9,
      });

      const matchesWithPrice = matcherWithPrice.findMatches(locations);
      const matchesWithoutPrice = matcherWithoutPrice.findMatches(locations);

      // Price difference is 73% (> 40% threshold), so should not match with price consideration
      expect(matchesWithPrice).toHaveLength(0);

      // Without price consideration, should match with reasonable confidence for identical addresses/names
      expect(matchesWithoutPrice).toHaveLength(1);
      expect(matchesWithoutPrice[0].locations).toHaveLength(2);
      expect(matchesWithoutPrice[0].confidence_score).toBeGreaterThan(0.6);
    });
  });

  describe("Calibrated Algorithm Validation", () => {
    it("should produce sensible LAX matches after calibration", () => {
      const calibratedService = new LocationMatchingService();

      // Test the exact scenario we just validated
      const laxLocations: ParkingLocation[] = [
        // Group 1: Official LAX parking at 1 World Way - should match
        {
          provider_id: "pw_lax_001",
          provider: ParkingProvider.PARKWHIZ,
          name: "LAX Official Economy Parking",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.942536, longitude: -118.408075 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.5,
          pricing: { daily_rate: 24, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
        {
          provider_id: "201",
          provider: ParkingProvider.SPOTHERO,
          name: "LAX Economy Parking Lot C",
          address: {
            street: "1 World Way",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "1 World Way, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9425, longitude: -118.4081 },
          airport_code: "LAX",
          distance_to_airport_miles: 0.5,
          pricing: { daily_rate: 25, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },

        // Group 2: QuikPark at 9000 Airport Blvd - should match
        {
          provider_id: "pw_lax_002",
          provider: ParkingProvider.PARKWHIZ,
          name: "QuikPark LAX",
          address: {
            street: "9000 Airport Blvd.",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "9000 Airport Blvd., Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.946789, longitude: -118.395234 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.2,
          pricing: { daily_rate: 18.95, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: true,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider_id: "202",
          provider: ParkingProvider.SPOTHERO,
          name: "QuikPark LAX Premium",
          address: {
            street: "9000 Airport Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "9000 Airport Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9468, longitude: -118.3952 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.2,
          pricing: { daily_rate: 19.95, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: true,
          covered_parking: true,
          provider_data: {},
        },
        {
          provider_id: "cap_lax_002",
          provider: ParkingProvider.CHEAP_AIRPORT_PARKING,
          name: "QuikPark Budget LAX",
          address: {
            street: "9000 Airport Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "9000 Airport Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9467, longitude: -118.3953 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.3,
          pricing: { daily_rate: 17.99, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: true,
          covered_parking: true,
          provider_data: {},
        },

        // Should NOT match with above groups - different address
        {
          provider_id: "cap_lax_001",
          provider: ParkingProvider.CHEAP_AIRPORT_PARKING,
          name: "LAX Economy Super Saver",
          address: {
            street: "8888 Airport Blvd",
            city: "Los Angeles",
            state: "CA",
            zip: "90045",
            full_address: "8888 Airport Blvd, Los Angeles, CA 90045",
          },
          coordinates: { latitude: 33.9456, longitude: -118.3967 },
          airport_code: "LAX",
          distance_to_airport_miles: 1.5,
          pricing: { daily_rate: 12.95, currency: "USD" },
          amenities: [],
          availability: true,
          shuttle_service: true,
          valet_service: false,
          covered_parking: false,
          provider_data: {},
        },
      ];

      const matches = calibratedService.findMatches(laxLocations);

      // Should find exactly 2 matches (not the problematic 4-provider grouping we had before)
      expect(matches).toHaveLength(2);

      // Match 1: Should be QuikPark facilities at 9000 Airport Blvd (3 providers)
      const quikParkMatch = matches.find((m: any) =>
        m.canonical_name.includes("QuikPark")
      );
      expect(quikParkMatch).toBeDefined();
      expect(quikParkMatch!.locations).toHaveLength(3);
      expect(quikParkMatch!.confidence_score).toBeGreaterThan(0.8);

      // All QuikPark locations should be at same address
      quikParkMatch!.locations.forEach((loc: any) => {
        expect(loc.address.full_address).toContain("9000 Airport Blvd");
      });

      // Match 2: Should be LAX Official parking at 1 World Way (2 providers)
      const officialMatch = matches.find(
        (m: any) =>
          m.canonical_name.includes("LAX Official") ||
          m.canonical_name.includes("LAX Economy")
      );
      expect(officialMatch).toBeDefined();
      expect(officialMatch!.locations).toHaveLength(2);
      expect(officialMatch!.confidence_score).toBeGreaterThan(0.6);

      // All official LAX locations should be at same address
      officialMatch!.locations.forEach((loc: any) => {
        expect(loc.address.full_address).toContain("1 World Way");
      });

      // Ensure LAX Economy Super Saver at 8888 Airport Blvd is correctly excluded
      const allMatchedLocationIds = matches.flatMap((m: any) =>
        m.locations.map((l: any) => l.provider_id)
      );
      expect(allMatchedLocationIds).not.toContain("cap_lax_001"); // Should be rejected due to different address
    });
  });
});
