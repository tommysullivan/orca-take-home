import { ParkingLocation, ParkingProvider, ApiSearchParams } from "./providers";

export interface CheapAirportParkingLocation {
  lot_id: string;
  lot_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location: {
    lat: number;
    lon: number;
  };
  airport: string;
  miles_from_airport: number;
  services: {
    shuttle_service: boolean;
    valet_parking: boolean;
    indoor_parking: boolean;
    security_patrol: boolean;
  };
  pricing: {
    daily_rate: number;
    weekly_rate?: number;
    currency: string;
  };
  availability: {
    spaces_available: number;
    total_spaces: number;
  };
}

/**
 * Cheap Airport Parking Service Implementation
 *
 * Known for budget-friendly airport parking options
 * Typically focuses on off-site lots with shuttle service
 */
export class CheapAirportParkingService {
  private readonly baseUrl = "https://api.cheapairportparking.com/v2";
  private readonly mockData: CheapAirportParkingLocation[] = [
    // Chicago ORD Airport Data
    {
      lot_id: "cap_ord_001",
      lot_name: "ORD Budget Park & Fly",
      address: {
        street: "8801 W Higgins Rd",
        city: "Chicago",
        state: "IL",
        zip: "60631",
      },
      location: {
        lat: 41.9821,
        lon: -87.8421,
      },
      airport: "ORD",
      miles_from_airport: 3.2,
      services: {
        shuttle_service: true,
        valet_parking: false,
        indoor_parking: false,
        security_patrol: true,
      },
      pricing: {
        daily_rate: 11.99,
        weekly_rate: 71.94,
        currency: "USD",
      },
      availability: {
        spaces_available: 156,
        total_spaces: 300,
      },
    },
    {
      lot_id: "cap_ord_002",
      lot_name: "O'Hare Express Parking",
      address: {
        street: "5801 N River Rd",
        city: "Rosemont",
        state: "IL",
        zip: "60018",
      },
      location: {
        lat: 41.9834,
        lon: -87.8592,
      },
      airport: "ORD",
      miles_from_airport: 2.1,
      services: {
        shuttle_service: true,
        valet_parking: false,
        indoor_parking: false,
        security_patrol: true,
      },
      pricing: {
        daily_rate: 13.95,
        weekly_rate: 83.7,
        currency: "USD",
      },
      availability: {
        spaces_available: 89,
        total_spaces: 200,
      },
    },
    {
      lot_id: "cap_ord_003",
      lot_name: "River Road Economy Lot",
      address: {
        street: "5270 N River Rd",
        city: "Chicago",
        state: "IL",
        zip: "60018",
      },
      location: {
        lat: 41.9753,
        lon: -87.8739,
      },
      airport: "ORD",
      miles_from_airport: 0.9,
      services: {
        shuttle_service: true,
        valet_parking: false,
        indoor_parking: true,
        security_patrol: true,
      },
      pricing: {
        daily_rate: 16.5,
        weekly_rate: 99.0,
        currency: "USD",
      },
      availability: {
        spaces_available: 45,
        total_spaces: 150,
      },
    },
    // Los Angeles LAX Airport Data
    {
      lot_id: "cap_lax_001",
      lot_name: "LAX Economy Super Saver",
      address: {
        street: "8888 Airport Blvd",
        city: "Los Angeles",
        state: "CA",
        zip: "90045",
      },
      location: {
        lat: 33.9456,
        lon: -118.3967,
      },
      airport: "LAX",
      miles_from_airport: 1.5,
      services: {
        shuttle_service: true,
        valet_parking: false,
        indoor_parking: false,
        security_patrol: true,
      },
      pricing: {
        daily_rate: 12.95,
        weekly_rate: 77.7,
        currency: "USD",
      },
      availability: {
        spaces_available: 234,
        total_spaces: 400,
      },
    },
    {
      lot_id: "cap_lax_002",
      lot_name: "QuikPark Budget LAX",
      address: {
        street: "9000 Airport Blvd",
        city: "Los Angeles",
        state: "CA",
        zip: "90045",
      },
      location: {
        lat: 33.9467,
        lon: -118.3953,
      },
      airport: "LAX",
      miles_from_airport: 1.3,
      services: {
        shuttle_service: true,
        valet_parking: true,
        indoor_parking: true,
        security_patrol: true,
      },
      pricing: {
        daily_rate: 17.99,
        weekly_rate: 107.94,
        currency: "USD",
      },
      availability: {
        spaces_available: 67,
        total_spaces: 180,
      },
    },
  ];

  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 Cheap Airport Parking: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter by airport code
    const filteredLocations = this.mockData.filter(
      (location) => location.airport === params.airport_code
    );

    return filteredLocations.map((location) =>
      this.normalizeLocation(location)
    );
  }

  private normalizeLocation(
    location: CheapAirportParkingLocation
  ): ParkingLocation {
    return {
      provider_id: location.lot_id,
      provider: ParkingProvider.CHEAP_AIRPORT_PARKING,
      name: location.lot_name,
      address: {
        street: location.address.street,
        city: location.address.city,
        state: location.address.state,
        zip: location.address.zip,
        full_address: `${location.address.street}, ${location.address.city}, ${location.address.state} ${location.address.zip}`,
      },
      coordinates: {
        latitude: location.location.lat,
        longitude: location.location.lon,
      },
      airport_code: location.airport,
      distance_to_airport_miles: location.miles_from_airport,
      pricing: {
        daily_rate: location.pricing.daily_rate,
        currency: location.pricing.currency,
      },
      amenities: this.extractAmenities(location.services),
      availability: location.availability.spaces_available > 0,
      shuttle_service: location.services.shuttle_service,
      valet_service: location.services.valet_parking,
      covered_parking: location.services.indoor_parking,
      provider_data: {
        weekly_rate: location.pricing.weekly_rate,
        spaces_available: location.availability.spaces_available,
        total_spaces: location.availability.total_spaces,
        security_patrol: location.services.security_patrol,
        original_data: location,
      },
    };
  }

  private extractAmenities(
    services: CheapAirportParkingLocation["services"]
  ): string[] {
    const amenityList: string[] = [];

    if (services.shuttle_service) amenityList.push("shuttle");
    if (services.valet_parking) amenityList.push("valet");
    if (services.indoor_parking) amenityList.push("covered");
    if (services.security_patrol) amenityList.push("security");

    return amenityList;
  }

  async getLocationDetails(
    providerId: string
  ): Promise<ParkingLocation | null> {
    const location = this.mockData.find((loc) => loc.lot_id === providerId);
    return location ? this.normalizeLocation(location) : null;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("🔗 Testing Cheap Airport Parking API connection...");
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log("✅ Cheap Airport Parking: Mock service ready");
      return true;
    } catch (error) {
      console.error("❌ Cheap Airport Parking connection failed:", error);
      return false;
    }
  }
}

export const cheapAirportParkingService = new CheapAirportParkingService();
