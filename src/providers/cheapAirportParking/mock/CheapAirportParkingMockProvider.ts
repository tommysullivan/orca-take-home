import { ParkingLocation } from "../../common/ParkingLocation";
import { ApiSearchParams } from "../../common/ApiSearchParams";
import { ParkingProviderType } from "../../common/ParkingProviderType";
import { ParkingProvider } from "../../common/ParkingProvider";
import {
  mockHtmlResponses,
  mockDetailPageResponses,
} from "./mockHtmlResponses.js";
import { parseHTMLResponse } from "../parseHTMLResponse.js";
import { normalizeLocation } from "../normalizeLocation.js";
import { CheapAirportParkingRawLocation } from "../CheapAirportParkingRawLocation.js";
import { JSDOM } from "jsdom";

/**
 * Mock implementation of CheapAirportParking provider
 * Uses mock HTML responses to test the full parsing pipeline
 *
 * This shares the same parsing and normalization logic as the real provider:
 * - parseHTMLResponse: extracts data from HTML structure
 * - fetchAddressesInBatches: fetches addresses in batches (same logic as real)
 * - fetchLocationAddress: extracts address from detail pages (mocked)
 * - normalizeLocation: converts raw data to common ParkingLocation format
 */
export class CheapAirportParkingMockProvider implements ParkingProvider {
  readonly provider_type = ParkingProviderType.CHEAP_AIRPORT_PARKING;

  // Batch size for fetching detail pages (same as real provider)
  private readonly detailPageBatchSize = 5;

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

    // Fetch address details in batches (same logic as real provider)
    const rawLocationsWithAddresses = await this.fetchAddressesInBatches(
      rawLocations
    );

    // Normalize to common format (same logic as real provider)
    return rawLocationsWithAddresses.map((rawLocation) =>
      normalizeLocation(rawLocation, params)
    );
  }

  /**
   * Fetch addresses for multiple locations in batches (same logic as real provider)
   */
  private async fetchAddressesInBatches(
    locations: CheapAirportParkingRawLocation[]
  ): Promise<CheapAirportParkingRawLocation[]> {
    const results: CheapAirportParkingRawLocation[] = [];

    // Process locations in batches
    for (let i = 0; i < locations.length; i += this.detailPageBatchSize) {
      const batch = locations.slice(i, i + this.detailPageBatchSize);

      // Fetch addresses for all locations in this batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (raw) => {
          try {
            const address = await this.fetchLocationAddress(raw);
            return { ...raw, address };
          } catch (error) {
            console.warn(`⚠️  Failed to fetch address for ${raw.name}:`, error);
            // Return without address if fetch fails
            return raw;
          }
        })
      );

      results.push(...batchResults);

      // Add a small delay between batches (same as real provider)
      if (i + this.detailPageBatchSize < locations.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Fetch address from mock detail page
   * Uses the same parsing logic as the real provider but with mocked HTML
   */
  private async fetchLocationAddress(
    location: CheapAirportParkingRawLocation
  ): Promise<{
    street: string;
    city: string;
    state: string;
    zip: string;
    full_address: string;
  }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Build the key for the mock detail page
    const detailKey = `${location.park_id}_${location.lot_id}`;
    const html = mockDetailPageResponses[detailKey];

    if (!html) {
      throw new Error(`No mock detail page found for ${detailKey}`);
    }

    // Parse the address from schema.org markup (same logic as real provider)
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const streetAddress =
      document
        .querySelector('[itemprop="streetAddress"]')
        ?.textContent?.trim() || "";
    const city =
      document
        .querySelector('[itemprop="addressLocality"]')
        ?.textContent?.trim() || "";
    const state =
      document
        .querySelector('[itemprop="addressRegion"]')
        ?.textContent?.trim() || "";
    const zip =
      document.querySelector('[itemprop="postalCode"]')?.textContent?.trim() ||
      "";

    const full_address = [streetAddress, city, state, zip]
      .filter((part) => part)
      .join(", ");

    return {
      street: streetAddress,
      city,
      state,
      zip,
      full_address,
    };
  }
}

export const cheapAirportParkingMockProvider =
  new CheapAirportParkingMockProvider();
