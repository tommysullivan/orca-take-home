import { ParkingLocation } from "../../common/ParkingLocation";
import { ApiSearchParams } from "../../common/ApiSearchParams";
import { ParkingProviderType } from "../../common/ParkingProviderType";
import { ParkingProvider } from "../../common/ParkingProvider";
import { mockHtmlResponses } from "./mockHtmlResponses.js";
import { parseHTMLResponse } from "../parseHTMLResponse.js";
import { normalizeLocation } from "../normalizeLocation.js";

/**
 * Mock implementation of CheapAirportParking provider
 * Uses mock HTML responses to test the full parsing pipeline
 * 
 * This shares the same parsing and normalization logic as the real provider:
 * - parseHTMLResponse: extracts data from HTML structure
 * - normalizeLocation: converts raw data to common ParkingLocation format
 */
export class CheapAirportParkingMockProvider implements ParkingProvider {
  readonly provider_type = ParkingProviderType.CHEAP_AIRPORT_PARKING;

  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 Cheap Airport Parking (Mock): Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get mock HTML response for the airport
    const html = mockHtmlResponses[params.airport_code];

    // If no data for this airport, return empty array
    if (!html) {
      return [];
    }

    // Parse HTML response (same logic as real provider)
    const rawLocations = parseHTMLResponse(html);

    // Normalize to common format (same logic as real provider)
    return rawLocations.map((rawLocation) =>
      normalizeLocation(rawLocation, params)
    );
  }
}

export const cheapAirportParkingMockProvider =
  new CheapAirportParkingMockProvider();

