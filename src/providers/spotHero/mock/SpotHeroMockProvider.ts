import { ParkingLocation } from "../../common/ParkingLocation";
import { ApiSearchParams } from "../../common/ApiSearchParams";
import { spotHeroMockData } from "./spotHeroMockData";
import { ParkingProvider } from "../../common/ParkingProvider";
import { normalizeLocation } from "../normalizeLocation";

/**
 * SpotHero Mock Provider
 * 
 * Uses the same data format and normalization logic as the real SpotHero provider,
 * but returns pre-defined mock data instead of making API calls.
 */
export class SpotHeroMockProvider implements ParkingProvider {
  private readonly mockData = spotHeroMockData;

  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 SpotHero (Mock): Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filter by airport (simplified logic - in reality would use geolocation)
    const filteredLocations = this.mockData.filter((location) => {
      const city = location.facility.common.addresses[0]?.city;
      if (params.airport_code === "ORD") {
        return city === "Chicago" || city === "Rosemont" || city === "Franklin Park";
      }
      if (params.airport_code === "LAX") {
        return city === "Los Angeles" || city === "El Segundo";
      }
      return false;
    });

    return filteredLocations.map((location) =>
      normalizeLocation(location)
    );
  }
}

export const spotHeroMockProvider = new SpotHeroMockProvider();
