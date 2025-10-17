import {
  ParkingLocation,
  ParkingProvider,
  ApiSearchParams,
  ParkingProviderService,
} from "../providers";
import { ParkWhizRealLocation } from "./parkwhiz-types";
import { normalizeLocation } from "./parkwhiz-utils";
import { filterLocationsByDateRange } from "../location-filter";

/**
 * Mock ParkWhiz Service Implementation
 *
 * This implementation provides realistic mock data for testing and development.
 * Uses the same data structure as the real API but with static mock data.
 */
export class MockParkWhizService implements ParkingProviderService {
  private readonly mockData: ParkWhizRealLocation[] = [
    // Chicago ORD Airport Data (based on real API structure)
    {
      location_id: "15012",
      type: "offstreet",
      start_time: "2024-12-20T09:00:00.000-06:00",
      end_time: "2024-12-21T19:00:00.000-06:00",
      min_start: "2024-12-20T09:00:00.000-06:00",
      max_end: "2024-12-21T19:00:00.000-06:00",
      distance: {
        straight_line: {
          meters: 2060,
          feet: 6761,
        },
      },
      purchase_options: [
        {
          id: "f4b17c79-02d6-4242-9780-c154df6d260f",
          start_time: "2024-12-20T09:00:00.000-06:00",
          end_time: "2024-12-21T19:00:00.000-06:00",
          min_start: "2024-12-20T09:00:00.000-06:00",
          max_end: "2024-12-21T19:00:00.000-06:00",
          base_price: { USD: "21.00" },
          price: { USD: "21.00" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 4444934,
              start_time: "2024-12-20T22:00:00.000-05:00",
              end_time: "2024-12-21T22:00:00.000-05:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          shuttle: true,
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
          amenities: [
            {
              name: "Covered",
              key: "indoor",
              description: "Covered",
              enabled: true,
              visible: true,
            },
            {
              name: "Security",
              key: "security", 
              description: "Security",
              enabled: true,
              visible: true,
            },
            {
              name: "Attended",
              key: "attended",
              description: "Attended",
              enabled: true,
              visible: true,
            },
            {
              name: "Shuttle",
              key: "shuttle",
              description: "Free Shuttle",
              enabled: true,
              visible: true,
            },
          ],
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
          entrances: [
            {
              coordinates: [41.9739278, -87.8624834],
            },
          ],
          timezone: "America/Chicago",
          msa: "Chicago",
          site_url: "/p/rosemont-parking/5272-n-river-rd",
          rating_summary: {
            average_rating: 4.68,
            rating_count: 176,
          },
          sellerId: 874,
        },
      },
    },
    {
      location_id: "15013",
      type: "offstreet",
      start_time: "2024-12-20T22:00:00.000-05:00",
      end_time: "2024-12-21T22:00:00.000-05:00",
      min_start: "2024-12-20T22:00:00.000-05:00",
      max_end: "2024-12-21T22:00:00.000-05:00",
      distance: {
        straight_line: {
          meters: 3200,
          feet: 10500,
        },
      },
      purchase_options: [
        {
          id: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
          start_time: "2024-12-20T22:00:00.000-05:00",
          end_time: "2024-12-21T22:00:00.000-05:00",
          min_start: "2024-12-20T22:00:00.000-05:00",
          max_end: "2024-12-21T22:00:00.000-05:00",
          base_price: { USD: "14.30" },
          price: { USD: "14.30" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 4444935,
              start_time: "2024-12-20T22:00:00.000-05:00",
              end_time: "2024-12-21T22:00:00.000-05:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          shuttle: true,
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
          amenities: [
            {
              name: "Shuttle",
              key: "shuttle",
              description: "Free Shuttle",
              enabled: true,
              visible: true,
            },
            {
              name: "Security",
              key: "security",
              description: "Security",
              enabled: true,
              visible: true,
            },
          ],
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
          entrances: [
            {
              coordinates: [41.983456, -87.859234],
            },
          ],
          timezone: "America/Chicago",
          msa: "Chicago",
          site_url: "/p/rosemont-parking/5801-n-river-rd",
          rating_summary: {
            average_rating: 4.2,
            rating_count: 89,
          },
          sellerId: 234,
        },
      },
    },
    // Los Angeles LAX Airport Data
    {
      location_id: "59931",
      type: "offstreet",
      start_time: "2024-12-20T08:00:00.000-08:00",
      end_time: "2024-12-21T20:00:00.000-08:00",
      min_start: "2024-12-20T08:00:00.000-08:00",
      max_end: "2024-12-21T20:00:00.000-08:00",
      distance: {
        straight_line: {
          meters: 1311,
          feet: 4301,
        },
      },
      purchase_options: [
        {
          id: "b6916202-d040-4bc2-8a70-bc2ecdcfa345",
          start_time: "2024-12-20T08:00:00.000-08:00",
          end_time: "2024-12-21T20:00:00.000-08:00",
          min_start: "2024-12-20T08:00:00.000-08:00",
          max_end: "2024-12-21T20:00:00.000-08:00",
          base_price: { USD: "24.00" },
          price: { USD: "24.00" },
          display: { price: "price" },
          pricing_segments: [
            {
              id: 5555001,
              start_time: "2024-12-20T08:00:00.000-08:00",
              end_time: "2024-12-21T20:00:00.000-08:00",
              event: {},
              space_availability: { status: "available" },
              pricing_type: "TransientPricing",
            },
          ],
          shuttle: true,
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
          amenities: [
            {
              name: "Covered",
              key: "indoor",
              description: "Covered",
              enabled: true,
              visible: true,
            },
            {
              name: "Shuttle",
              key: "shuttle",
              description: "Free Shuttle",
              enabled: true,
              visible: true,
            },
            {
              name: "Valet",
              key: "valet",
              description: "Valet",
              enabled: false,
              visible: false,
            },
          ],
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
          entrances: [
            {
              coordinates: [33.946789, -118.395234],
            },
          ],
          timezone: "America/Los_Angeles",
          msa: "Los Angeles",
          site_url: "/p/los-angeles-parking/9000-airport-blvd",
          rating_summary: {
            average_rating: 4.3,
            rating_count: 203,
          },
          sellerId: 456,
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

    // Normalize locations first (includes extracting availability dates)
    const normalizedLocations = filteredLocations.map(normalizeLocation);

    // Then filter by date range using the normalized availability dates
    const dateFilteredLocations = filterLocationsByDateRange(
      normalizedLocations,
      params.start_time,
      params.end_time
    );

    return dateFilteredLocations;
  }
}

export const mockParkWhizService = new MockParkWhizService();
