import { ParkingLocation } from "../../common/ParkingLocation";
import { ApiSearchParams } from "../../common/ApiSearchParams";
import { ParkingProviderType } from "../../common/ParkingProviderType";
import { spotHeroMockData } from "./spotHeroMockData";
import { SpotHeroMockLocation } from "./SpotHeroMockLocation";

/**
 * SpotHero Service Implementation
 *
 * SpotHero API patterns discovered:
 * - Uses REST API with location search
 * - Requires date/time parameters for pricing
 * - Returns structured location data with amenities
 */
export class SpotHeroMockProvider {
  private readonly mockData = spotHeroMockData;

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
    location: SpotHeroMockLocation,
    airportCode: string
  ): ParkingLocation {
    return {
      provider_id: location.id.toString(),
      provider: ParkingProviderType.SPOTHERO,
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

  private extractAmenities(
    amenities: SpotHeroMockLocation["amenities"]
  ): string[] {
    const amenityList: string[] = [];

    if (amenities.covered) amenityList.push("covered");
    if (amenities.valet) amenityList.push("valet");
    if (amenities.handicap_accessible) amenityList.push("handicap_accessible");
    if (amenities.electric_charging) amenityList.push("electric_charging");
    if (amenities.shuttle) amenityList.push("shuttle");

    return amenityList;
  }
}

export const spotHeroMockProvider = new SpotHeroMockProvider();
