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
    // Chicago ORD Airport Data
    {
      id: 101,
      name: "O'Hare International Airport Economy Lot E",
      description: "Official airport parking with shuttle service",
      street_address: "10000 Bessie Coleman Dr",
      city: "Chicago",
      state: "IL",
      postal_code: "60666",
      latitude: 41.9742,
      longitude: -87.9073,
      distance: 0.3,
      price: {
        amount: 25.0,
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
      id: 102,
      name: "River Road Self Park",
      description: "Covered parking near O'Hare with free shuttle",
      street_address: "5272 N River Rd",
      city: "Chicago",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9755,
      longitude: -87.8737,
      distance: 0.8,
      price: {
        amount: 22.95,
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
      id: 103,
      name: "Rosemont Blue Line Parking",
      description: "CTA Blue Line connected parking",
      street_address: "5801 N River Rd",
      city: "Rosemont",
      state: "IL",
      postal_code: "60018",
      latitude: 41.9835,
      longitude: -87.8592,
      distance: 2.1,
      price: {
        amount: 15.5,
        currency: "USD",
      },
      amenities: {
        covered: false,
        valet: false,
        handicap_accessible: true,
        electric_charging: false,
        shuttle: false,
      },
      available: true,
    },
    {
      id: 104,
      name: "Hyatt O'Hare Self Park",
      description: "Hotel parking lot with airport shuttle",
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
    // Los Angeles LAX Airport Data
    {
      id: 201,
      name: "LAX Economy Parking Lot C",
      description: "Official LAX parking with shuttle service",
      street_address: "1 World Way",
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9425,
      longitude: -118.4081,
      distance: 0.5,
      price: {
        amount: 25.0,
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
      id: 202,
      name: "QuikPark LAX Premium",
      description: "Off-site parking with valet service",
      street_address: "9000 Airport Blvd",
      city: "Los Angeles",
      state: "CA",
      postal_code: "90045",
      latitude: 33.9468,
      longitude: -118.3952,
      distance: 1.2,
      price: {
        amount: 19.95,
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
      airport_code: airportCode,
      distance_to_airport_miles: location.distance,
      pricing: {
        daily_rate: location.price.amount,
        currency: location.price.currency,
      },
      amenities: this.extractAmenities(location.amenities),
      availability: location.available,
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

  async getLocationDetails(
    providerId: string
  ): Promise<ParkingLocation | null> {
    const location = this.mockData.find(
      (loc) => loc.id.toString() === providerId
    );
    return location ? this.normalizeLocation(location, "") : null;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("🔗 Testing SpotHero API connection...");
      await new Promise((resolve) => setTimeout(resolve, 150));
      console.log("✅ SpotHero: Mock service ready");
      return true;
    } catch (error) {
      console.error("❌ SpotHero connection failed:", error);
      return false;
    }
  }
}

export const spotHeroService = new SpotHeroService();
