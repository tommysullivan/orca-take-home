import { ParkingLocation, ParkingProvider, ApiSearchParams } from "./providers";

export interface ParkWhizLocation {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  airport_code?: string;
  distance_to_airport?: number;
  amenities: string[];
  rates: {
    daily_rate: number;
    hourly_rate?: number;
    currency: string;
  };
  availability: boolean;
  provider_specific: {
    shuttle_service: boolean;
    valet: boolean;
    covered: boolean;
    security_level: string;
  };
}

/**
 * ParkWhiz Service Implementation
 *
 * Note: Based on investigation, ParkWhiz API requires client_id/client_secret for partners.
 * This implementation provides a realistic mock based on observed data patterns from their website.
 * Can be easily replaced with real API calls when credentials are obtained.
 */
export class ParkWhizService {
  private readonly baseUrl = "https://api.parkwhiz.com/v4";
  private readonly mockData: ParkWhizLocation[] = [
    // Chicago ORD Airport Data (based on observed website data)
    {
      id: "pw_ord_001",
      name: "Loews Chicago O'Hare Hotel Garage",
      address: {
        street: "5272 N. River Rd.",
        city: "Chicago",
        state: "IL",
        zip: "60018",
      },
      coordinates: {
        lat: 41.975528,
        lng: -87.873726,
      },
      airport_code: "ORD",
      distance_to_airport: 0.8,
      amenities: ["covered", "security", "elevators"],
      rates: {
        daily_rate: 23.1,
        hourly_rate: 3.5,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: false,
        valet: false,
        covered: true,
        security_level: "high",
      },
    },
    {
      id: "pw_ord_002",
      name: "CTA Blue Line: Rosemont Lot",
      address: {
        street: "5801 N. River Rd.",
        city: "Rosemont",
        state: "IL",
        zip: "60018",
      },
      coordinates: {
        lat: 41.983456,
        lng: -87.859234,
      },
      airport_code: "ORD",
      distance_to_airport: 2.1,
      amenities: ["shuttle", "security", "uncovered"],
      rates: {
        daily_rate: 14.3,
        hourly_rate: 2.25,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: true,
        valet: false,
        covered: false,
        security_level: "medium",
      },
    },
    {
      id: "pw_ord_003",
      name: "Hyatt Regency O'Hare Airport Lot",
      address: {
        street: "9300 Bryn Mawr Ave.",
        city: "Rosemont",
        state: "IL",
        zip: "60018",
      },
      coordinates: {
        lat: 41.975123,
        lng: -87.856789,
      },
      airport_code: "ORD",
      distance_to_airport: 1.2,
      amenities: ["shuttle", "security", "uncovered"],
      rates: {
        daily_rate: 23.59,
        hourly_rate: 3.75,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: true,
        valet: false,
        covered: false,
        security_level: "high",
      },
    },
    {
      id: "pw_ord_004",
      name: "CTA Blue Line Cumberland Garage",
      address: {
        street: "5800 N. Cumberland Ave.",
        city: "Chicago",
        state: "IL",
        zip: "60631",
      },
      coordinates: {
        lat: 41.983012,
        lng: -87.838567,
      },
      airport_code: "ORD",
      distance_to_airport: 3.5,
      amenities: ["covered", "security", "elevators"],
      rates: {
        daily_rate: 13.2,
        hourly_rate: 2.0,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: true,
        valet: false,
        covered: true,
        security_level: "medium",
      },
    },
    // Los Angeles LAX Airport Data
    {
      id: "pw_lax_001",
      name: "LAX Official Economy Parking",
      address: {
        street: "1 World Way",
        city: "Los Angeles",
        state: "CA",
        zip: "90045",
      },
      coordinates: {
        lat: 33.942536,
        lng: -118.408075,
      },
      airport_code: "LAX",
      distance_to_airport: 0.5,
      amenities: ["shuttle", "security", "uncovered"],
      rates: {
        daily_rate: 24.0,
        hourly_rate: 4.0,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: true,
        valet: false,
        covered: false,
        security_level: "high",
      },
    },
    {
      id: "pw_lax_002",
      name: "QuikPark LAX",
      address: {
        street: "9000 Airport Blvd.",
        city: "Los Angeles",
        state: "CA",
        zip: "90045",
      },
      coordinates: {
        lat: 33.946789,
        lng: -118.395234,
      },
      airport_code: "LAX",
      distance_to_airport: 1.2,
      amenities: ["shuttle", "valet", "covered"],
      rates: {
        daily_rate: 18.95,
        hourly_rate: 3.25,
        currency: "USD",
      },
      availability: true,
      provider_specific: {
        shuttle_service: true,
        valet: true,
        covered: true,
        security_level: "high",
      },
    },
  ];

  /**
   * Search for parking locations
   *
   * In a real implementation, this would make authenticated requests to:
   * POST https://api.parkwhiz.com/v4/search
   *
   * Required headers:
   * - Authorization: Bearer {token}
   * - Content-Type: application/json
   *
   * Required body parameters:
   * - destination: airport code or address
   * - start_time: ISO datetime
   * - end_time: ISO datetime
   * - client_id: partner credentials
   * - client_secret: partner credentials
   */
  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 ParkWhiz: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter mock data by airport code
    const filteredLocations = this.mockData.filter(
      (location) => location.airport_code === params.airport_code
    );

    // Convert to normalized format
    return filteredLocations.map((location) =>
      this.normalizeLocation(location)
    );
  }

  private normalizeLocation(location: ParkWhizLocation): ParkingLocation {
    return {
      provider_id: location.id,
      provider: ParkingProvider.PARKWHIZ,
      name: location.name,
      address: {
        street: location.address.street,
        city: location.address.city,
        state: location.address.state,
        zip: location.address.zip,
        full_address: `${location.address.street}, ${location.address.city}, ${
          location.address.state
        } ${location.address.zip || ""}`.trim(),
      },
      coordinates: location.coordinates
        ? {
            latitude: location.coordinates.lat,
            longitude: location.coordinates.lng,
          }
        : undefined,
      airport_code: location.airport_code,
      distance_to_airport_miles: location.distance_to_airport,
      pricing: {
        daily_rate: location.rates.daily_rate,
        hourly_rate: location.rates.hourly_rate,
        currency: location.rates.currency,
      },
      amenities: location.amenities,
      availability: location.availability,
      shuttle_service: location.provider_specific.shuttle_service,
      valet_service: location.provider_specific.valet,
      covered_parking: location.provider_specific.covered,
      provider_data: {
        security_level: location.provider_specific.security_level,
        original_data: location,
      },
    };
  }

  /**
   * Get location details by provider ID
   */
  async getLocationDetails(
    providerId: string
  ): Promise<ParkingLocation | null> {
    const location = this.mockData.find((loc) => loc.id === providerId);
    return location ? this.normalizeLocation(location) : null;
  }

  /**
   * Test API connectivity
   *
   * In real implementation, this would test:
   * GET https://api.parkwhiz.com/v4/health
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔗 Testing ParkWhiz API connection...");
      // Mock connection test
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("✅ ParkWhiz: Mock service ready");
      return true;
    } catch (error) {
      console.error("❌ ParkWhiz connection failed:", error);
      return false;
    }
  }
}

export const parkWhizService = new ParkWhizService();
