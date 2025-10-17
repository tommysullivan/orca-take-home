import {
  ParkingLocation,
  ParkingProvider,
  ApiSearchParams,
} from "../providers";
import { ParkWhizServiceInterface } from "./parkwhiz-service-interface";
import { ParkWhizRealLocation } from "./parkwhiz-types";

/**
 * Mock ParkWhiz Service Implementation
 *
 * This implementation provides realistic mock data for testing and development.
 * Uses the same data structure as the real API but with static mock data.
 */
export class MockParkWhizService implements ParkWhizServiceInterface {
  private readonly mockData: ParkWhizRealLocation[] = [
    // Chicago ORD Airport Data (based on real API structure)
    {
      location_id: "15012",
      type: "offstreet",
      start_time: "2025-10-16T22:00:00.000-05:00",
      end_time: "2025-10-17T22:00:00.000-05:00",
      min_start: "2025-10-16T22:00:00.000-05:00",
      max_end: "2025-10-17T22:00:00.000-05:00",
      distance: {
        straight_line: {
          meters: 2060,
          feet: 6761,
        },
      },
      purchase_options: [
        {
          id: "f4b17c79-02d6-4242-9780-c154df6d260f",
          start_time: "2025-10-16T22:00:00.000-05:00",
          end_time: "2025-10-17T22:00:00.000-05:00",
          min_start: "2025-10-16T22:00:00.000-05:00",
          max_end: "2025-10-17T22:00:00.000-05:00",
          base_price: { USD: "21.00" },
          price: { USD: "21.00" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 4444934,
              start_time: "2025-10-16T22:00:00.000-05:00",
              end_time: "2025-10-17T22:00:00.000-05:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          space_availability: { status: "available" },
          validation: {
            require_license_plate: true,
            display: { scan_code: "required" },
            validation_steps: [
              {
                instructions: "Scan QR code on arrival",
                icon: { path: "/icons/qr-code.svg" },
              },
            ],
          },
        },
      ],
      _embedded: {
        "pw:location": {
          id: "15012",
          name: "Loews Chicago O'Hare Hotel Garage",
          description: "Secure hotel garage near O'Hare Airport",
          address1: "5272 N. River Rd.",
          city: "Chicago",
          state: "IL",
          postal_code: "60018",
          coordinates: [41.9739278, -87.8624834],
          location_type: "garage",
          amenities: [
            {
              id: "covered",
              name: "covered",
              display_name: "Covered",
              icon_path: "/icons/covered.svg",
            },
            {
              id: "security",
              name: "security",
              display_name: "Security",
              icon_path: "/icons/security.svg",
            },
            {
              id: "elevators",
              name: "elevators",
              display_name: "Elevators",
              icon_path: "/icons/elevator.svg",
            },
          ],
        },
      },
    },
    {
      location_id: "15013",
      type: "offstreet",
      start_time: "2025-10-16T22:00:00.000-05:00",
      end_time: "2025-10-17T22:00:00.000-05:00",
      min_start: "2025-10-16T22:00:00.000-05:00",
      max_end: "2025-10-17T22:00:00.000-05:00",
      distance: {
        straight_line: {
          meters: 3200,
          feet: 10500,
        },
      },
      purchase_options: [
        {
          id: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
          start_time: "2025-10-16T22:00:00.000-05:00",
          end_time: "2025-10-17T22:00:00.000-05:00",
          min_start: "2025-10-16T22:00:00.000-05:00",
          max_end: "2025-10-17T22:00:00.000-05:00",
          base_price: { USD: "14.30" },
          price: { USD: "14.30" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 4444935,
              start_time: "2025-10-16T22:00:00.000-05:00",
              end_time: "2025-10-17T22:00:00.000-05:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          space_availability: { status: "available" },
          validation: {
            require_license_plate: true,
            display: { scan_code: "required" },
            validation_steps: [
              {
                instructions: "Present ticket at shuttle stop",
                icon: { path: "/icons/shuttle.svg" },
              },
            ],
          },
        },
      ],
      _embedded: {
        "pw:location": {
          id: "15013",
          name: "CTA Blue Line: Rosemont Lot",
          description: "Public transit parking with airport shuttle",
          address1: "5801 N. River Rd.",
          city: "Rosemont",
          state: "IL",
          postal_code: "60018",
          coordinates: [41.983456, -87.859234],
          location_type: "lot",
          amenities: [
            {
              id: "shuttle",
              name: "shuttle",
              display_name: "Shuttle Service",
              icon_path: "/icons/shuttle.svg",
            },
            {
              id: "security",
              name: "security",
              display_name: "Security",
              icon_path: "/icons/security.svg",
            },
          ],
        },
      },
    },
    // Los Angeles LAX Airport Data
    {
      location_id: "59931",
      type: "offstreet",
      start_time: "2025-10-16T20:00:00.000-07:00",
      end_time: "2025-10-17T20:00:00.000-07:00",
      min_start: "2025-10-16T20:00:00.000-07:00",
      max_end: "2025-10-17T20:00:00.000-07:00",
      distance: {
        straight_line: {
          meters: 1311,
          feet: 4301,
        },
      },
      purchase_options: [
        {
          id: "b6916202-d040-4bc2-8a70-bc2ecdcfa345",
          start_time: "2025-10-16T20:00:00.000-07:00",
          end_time: "2025-10-17T20:00:00.000-07:00",
          min_start: "2025-10-16T20:00:00.000-07:00",
          max_end: "2025-10-17T20:00:00.000-07:00",
          base_price: { USD: "24.00" },
          price: { USD: "24.00" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 5555001,
              start_time: "2025-10-16T20:00:00.000-07:00",
              end_time: "2025-10-17T20:00:00.000-07:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          space_availability: { status: "available" },
          validation: {
            require_license_plate: true,
            display: { scan_code: "required" },
            validation_steps: [
              {
                instructions: "Show confirmation at gate",
                icon: { path: "/icons/gate.svg" },
              },
            ],
          },
        },
      ],
      _embedded: {
        "pw:location": {
          id: "59931",
          name: "QuikPark LAX Garage",
          description: "Convenient garage near LAX terminals",
          address1: "9000 Airport Blvd.",
          city: "Los Angeles",
          state: "CA",
          postal_code: "90045",
          coordinates: [33.946789, -118.395234],
          location_type: "garage",
          amenities: [
            {
              id: "shuttle",
              name: "shuttle",
              display_name: "Shuttle Service",
              icon_path: "/icons/shuttle.svg",
            },
            {
              id: "covered",
              name: "covered",
              display_name: "Covered",
              icon_path: "/icons/covered.svg",
            },
            {
              id: "valet",
              name: "valet",
              display_name: "Valet Service",
              icon_path: "/icons/valet.svg",
            },
          ],
        },
      },
    },
  ];

  /**
   * Search for parking locations
   */
  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 ParkWhiz: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For mock data, we'll filter by checking if the location name/address contains airport references
    const airportCode = params.airport_code.toLowerCase();
    const filteredLocations = this.mockData.filter((location) => {
      const locationData = location._embedded["pw:location"];
      const name = locationData.name.toLowerCase();
      const address = locationData.address1.toLowerCase();
      const city = locationData.city.toLowerCase();

      // Simple filtering logic for mock data - check for airport references
      if (airportCode === "ord") {
        return (
          name.includes("o'hare") ||
          city.includes("chicago") ||
          city.includes("rosemont")
        );
      } else if (airportCode === "lax") {
        return name.includes("lax") || city.includes("los angeles");
      }
      return false;
    });

    // Convert to normalized format
    return filteredLocations.map((location) =>
      this.normalizeLocation(location)
    );
  }

  private normalizeLocation(location: ParkWhizRealLocation): ParkingLocation {
    const locationData = location._embedded["pw:location"];
    const firstPurchaseOption = location.purchase_options[0];

    // Extract amenity names for simple array
    const amenityNames = locationData.amenities.map((amenity) => amenity.name);

    // Determine service features based on amenities
    const shuttleService = amenityNames.includes("shuttle");
    const valetService = amenityNames.includes("valet");
    const coveredParking =
      amenityNames.includes("covered") ||
      locationData.location_type === "garage";

    // Convert distance from feet to miles
    const distanceMiles = location.distance.straight_line.feet / 5280;

    // Extract pricing from first purchase option
    const dailyRate = parseFloat(firstPurchaseOption.price.USD);

    return {
      provider_id: location.location_id,
      provider: ParkingProvider.PARKWHIZ,
      name: locationData.name,
      address: {
        street: locationData.address1,
        city: locationData.city,
        state: locationData.state,
        zip: locationData.postal_code,
        full_address:
          `${locationData.address1}, ${locationData.city}, ${locationData.state} ${locationData.postal_code}`.trim(),
      },
      coordinates: {
        latitude: locationData.coordinates[0],
        longitude: locationData.coordinates[1],
      },
      airport_code: this.inferAirportCode(locationData.city, locationData.name),
      distance_to_airport_miles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
      pricing: {
        daily_rate: dailyRate,
        currency: "USD",
      },
      amenities: amenityNames,
      availability:
        firstPurchaseOption.space_availability.status === "available",
      shuttle_service: shuttleService,
      valet_service: valetService,
      covered_parking: coveredParking,
      provider_data: {
        location_type: locationData.location_type,
        description: locationData.description,
        purchase_options: location.purchase_options,
        original_data: location,
      },
    };
  }

  /**
   * Infer airport code from location data for mock purposes
   */
  private inferAirportCode(city: string, name: string): string | undefined {
    const cityLower = city.toLowerCase();
    const nameLower = name.toLowerCase();

    if (
      cityLower.includes("chicago") ||
      cityLower.includes("rosemont") ||
      nameLower.includes("o'hare")
    ) {
      return "ORD";
    }
    if (cityLower.includes("los angeles") || nameLower.includes("lax")) {
      return "LAX";
    }
    return undefined;
  }
}

export const mockParkWhizService = new MockParkWhizService();
