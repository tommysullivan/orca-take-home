import {
  ParkingLocation,
  ParkingProvider,
  ApiSearchParams,
} from "../providers";

export interface SpotHeroLocation {
  id: number;
  name: string;
  description: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  distance: number; // in miles
  price: {
    amount: number;
    currency: "USD";
  };
  amenities: {
    covered: boolean;
    valet: boolean;
    handicap_accessible: boolean;
    electric_charging: boolean;
    shuttle: boolean;
  };
  available: boolean;
  // Availability date range
  available_from?: string; // ISO datetime
  available_until?: string; // ISO datetime
}

/**
 * SpotHero Service Implementation
 *
 * SpotHero API patterns discovered:
 * - Uses REST API with location search
 * - Requires date/time parameters for pricing
 * - Returns structured location data with amenities
 */
export class SpotHeroService {
  private readonly baseUrl = "https://api.spothero.com/v1";
  private readonly mockData: SpotHeroLocation[] = [
    // Chicago ORD Airport Data - Updated to match real ParkWhiz locations for better matching
    {
      id: 101,
      name: "Loews Chicago O'Hare Hotel - Self Park",
      description: "Hotel parking at the Loews O'Hare with shuttle service",
      street_address: "5270 N River Rd", // Close to real ParkWhiz "5272 N. River Rd."
      city: "Rosemont",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9740,
      longitude: -87.8625,
      distance: 0.4,
      price: {
        amount: 19.50,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
      available_from: "2024-12-20T06:00:00.000-06:00",
      available_until: "2024-12-22T23:59:00.000-06:00",
    },
    {
      id: 102,
      name: "Easy Airport Parking ORD",
      description: "Secure self-park facility near O'Hare",
      street_address: "4002 N Mannheim Rd", // Close to real ParkWhiz "4000 N. Mannheim Rd."
      city: "Franklin Park",
      state: "IL",
      postal_code: "60131",
      latitude: 41.9520,
      longitude: -87.8859,
      distance: 1.9,
      price: {
        amount: 16.99,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
      available_from: "2024-12-20T06:00:00.000-06:00",
      available_until: "2024-12-22T23:59:00.000-06:00",
    },
    {
      id: 103,
      available_from: "2024-12-20T06:00:00.000-06:00",
      available_until: "2024-12-22T23:59:00.000-06:00",
      name: "River Road Economy Parking",
      description: "Budget parking with frequent shuttle service",
      street_address: "5275 N River Rd",
      city: "Rosemont",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9750,
      longitude: -87.8740,
      distance: 0.9,
      price: {
        amount: 14.95,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 104,
      available_from: "2024-12-20T06:00:00.000-06:00",
      available_until: "2024-12-22T23:59:00.000-06:00",
      name: "O'Hare Park & Fly Hotel Lot",
      description: "Hotel parking with overnight stay packages",
      street_address: "9300 Bryn Mawr Ave",
      city: "Rosemont",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9751,
      longitude: -87.8568,
      distance: 1.2,
      price: {
        amount: 24.99,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 105,
      available_from: "2024-12-20T06:00:00.000-06:00",
      available_until: "2024-12-22T23:59:00.000-06:00",
      name: "Loews O'Hare Hotel Garage",
      description: "Premium hotel garage with covered parking",
      street_address: "5272 N River Rd", // Exact match to real ParkWhiz "5272 N. River Rd."
      city: "Rosemont",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9739,
      longitude: -87.8625,
      distance: 0.4,
      price: {
        amount: 20.50,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    // Los Angeles LAX Airport Data - Updated to match real ParkWhiz locations
    {
      id: 201,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "QuikPark LAX Self-Park",
      description: "Premium off-site parking near LAX",
      street_address: "9820 Vicksburg Ave", // Close to real ParkWhiz "9821 Vicksburg Ave."
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9464,
      longitude: -118.3943,
      distance: 0.8,
      price: {
        amount: 23.99,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: false,
        handicap_accessible: true,
        electric_charging: true,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 202,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "Embassy Suites LAX Self Park",
      description: "Hotel parking with shuttle to LAX terminals",
      street_address: "1442 E Imperial Ave", // Close to real ParkWhiz "1440 E. Imperial Ave."
      city: "El Segundo",
      state: "CA",
      postal_code: "90245",
      latitude: 33.9308,
      longitude: -118.4008,
      distance: 0.9,
      price: {
        amount: 12.50,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 203,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "Joe's LAX Airport Parking",
      description: "Budget-friendly airport parking with covered options",
      street_address: "6155 W Century Blvd", // Close to real ParkWhiz "6151 W. Century Blvd."
      city: "Los Angeles", 
      state: "CA",
      postal_code: "90045",
      latitude: 33.9457,
      longitude: -118.3925,
      distance: 0.9,
      price: {
        amount: 17.95,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 204,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "Sheraton Gateway LAX Self Park",
      description: "Hotel parking with airport shuttle service",
      street_address: "6099 W Century Blvd", // Close to real ParkWhiz "6101 W. Century Blvd."
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9460,
      longitude: -118.3902,
      distance: 1.0,
      price: {
        amount: 19.99,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 205,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "Pacific Coast Highway Garage",
      description: "Convenient garage parking near LAX",
      street_address: "907 N Pacific Coast Hwy", // Close to real ParkWhiz "909 N. Pacific Coast Hwy."
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9302,
      longitude: -118.3964,
      distance: 1.1,
      price: {
        amount: 9.50,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: true,
      },
      available: true,
    },
    {
      id: 206,
      available_from: "2024-12-20T06:00:00.000-08:00",
      available_until: "2024-12-22T23:59:00.000-08:00",
      name: "WallyPark LAX Premium",
      description: "Premium parking with valet options",
      street_address: "9698 Bellanca Ave", // Close to real ParkWhiz "9700 Bellanca Ave."
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9385,
      longitude: -118.4087,
      distance: 0.7,
      price: {
        amount: 28.99,
        currency: "USD",
      },
      amenities: {
        covered: true,
        valet: true,
        handicap_accessible: true,
        electric_charging: true,
        shuttle: true,
      },
      available: true,
    },
  ];

  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 SpotHero: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filter by airport (simplified logic - in reality would use geolocation)
    const filteredLocations = this.mockData.filter((location) => {
      if (params.airport_code === "ORD") {
        return location.city === "Chicago" || location.city === "Rosemont";
      }
      if (params.airport_code === "LAX") {
        return location.city === "Los Angeles";
      }
      return false;
    });

    return filteredLocations.map((location) =>
      this.normalizeLocation(location, params.airport_code)
    );
  }

  private normalizeLocation(
    location: SpotHeroLocation,
    airportCode: string
  ): ParkingLocation {
    return {
      provider_id: location.id.toString(),
      provider: ParkingProvider.SPOTHERO,
      name: location.name,
      address: {
        street: location.street_address,
        city: location.city,
        state: location.state,
        zip: location.postal_code,
        full_address: `${location.street_address}, ${location.city}, ${location.state} ${location.postal_code}`,
      },
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      distance_to_airport_miles: location.distance,
      pricing: {
        daily_rate: location.price.amount,
        currency: location.price.currency,
      },
      amenities: this.extractAmenities(location.amenities),
      availability: location.available,
      // Extract availability dates from mock data
      available_from: location.available_from,
      available_until: location.available_until,
      shuttle_service: location.amenities.shuttle,
      valet_service: location.amenities.valet,
      covered_parking: location.amenities.covered,
      provider_data: {
        description: location.description,
        electric_charging: location.amenities.electric_charging,
        handicap_accessible: location.amenities.handicap_accessible,
        original_data: location,
      },
    };
  }

  private extractAmenities(amenities: SpotHeroLocation["amenities"]): string[] {
    const amenityList: string[] = [];

    if (amenities.covered) amenityList.push("covered");
    if (amenities.valet) amenityList.push("valet");
    if (amenities.handicap_accessible) amenityList.push("handicap_accessible");
    if (amenities.electric_charging) amenityList.push("electric_charging");
    if (amenities.shuttle) amenityList.push("shuttle");

    return amenityList;
  }
}

export const spotHeroService = new SpotHeroService();
