import { ParkingLocation } from "../common/ParkingLocation";
import { ApiSearchParams } from "../common/ApiSearchParams";
import { ParkingProviderType } from "../common/ParkingProviderType";
import { CheapAirportParkingLocation } from "./CheapAirportParkingLocation";
import { mockData } from "./mockData";

/**
 * Cheap Airport Parking Service Implementation
 *
 * Known for budget-friendly airport parking options
 * Typically focuses on off-site lots with shuttle service
 */
export class CheapAirportParkingMockProvider {
  private readonly baseUrl = "https://api.cheapairportparking.com/v2";
  private readonly mockData = mockData;

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
      provider: ParkingProviderType.CHEAP_AIRPORT_PARKING,
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
      distance_to_airport_miles: location.miles_from_airport,
      pricing: {
        daily_rate: location.pricing.daily_rate,
        currency: location.pricing.currency,
      },
      amenities: this.extractAmenities(location.services),
      availability: location.availability.spaces_available > 0,
      // Extract availability dates from mock data
      available_from: location.available_from,
      available_until: location.available_until,
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
}

export const cheapAirportParkingMockProvider =
  new CheapAirportParkingMockProvider();
