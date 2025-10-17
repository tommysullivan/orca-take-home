import { ParkingProvider } from "../common/ParkingProvider";
import { ParkingLocation } from "../common/ParkingLocation";
import { ApiSearchParams } from "../common/ApiSearchParams";
import { SpotHeroSearchResponse } from "./SpotHeroTypes";
import { normalizeLocation } from "./normalizeLocation";

/**
 * Real SpotHero Service Implementation
 *
 * SpotHero provides a direct public API for searching airport parking.
 * The API accepts an IATA airport code and date range, returning available
 * parking facilities with pricing, amenities, and availability information.
 *
 * API Endpoint: https://api.spothero.com/v2/search/airport
 * Parameters:
 * - iata: Airport code (e.g., "ORD", "LAX")
 * - starts: ISO datetime string (e.g., "2025-10-18T12:00:00")
 * - ends: ISO datetime string (e.g., "2025-10-22T12:00:00")
 * - oversize: boolean (default: false)
 * - show_unavailable: boolean (default: false)
 */
export class SpotHeroProvider implements ParkingProvider {
  private readonly baseUrl = "https://api.spothero.com/v2/search/airport";

  /**
   * Search for parking locations using the SpotHero API
   */
  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 SpotHero: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    try {
      const rawResults = await this.fetchLocations(params);
      
      // Normalize all results to our common format
      const normalizedLocations = rawResults.map(normalizeLocation);

      console.log(`✅ SpotHero: Found ${normalizedLocations.length} locations`);
      return normalizedLocations;
    } catch (error) {
      console.error("❌ SpotHero: Failed to search locations:", error);
      throw error;
    }
  }

  /**
   * Fetch locations from the SpotHero API
   */
  private async fetchLocations(
    params: ApiSearchParams
  ): Promise<SpotHeroSearchResponse["results"]> {
    // Build the API URL with query parameters
    const url = new URL(this.baseUrl);
    url.searchParams.set("iata", params.airport_code);
    url.searchParams.set("starts", params.start_time);
    url.searchParams.set("ends", params.end_time);
    url.searchParams.set("oversize", "false");
    url.searchParams.set("show_unavailable", "false");

    console.log(`🌐 SpotHero: Fetching from API: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `SpotHero API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as SpotHeroSearchResponse;

    console.log(`📊 SpotHero: Retrieved ${data.results.length} results`);

    return data.results;
  }
}

export const spotHeroProvider = new SpotHeroProvider();
