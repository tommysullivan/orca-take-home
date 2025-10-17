import { ParkingProvider } from "../common/ParkingProvider.js";
import { ParkingLocation } from "../common/ParkingLocation.js";
import { ApiSearchParams } from "../common/ApiSearchParams.js";
import { CheapAirportParkingRawLocation } from "./CheapAirportParkingRawLocation.js";
import { normalizeLocation } from "./normalizeLocation.js";
import { parseHTMLResponse } from "./parseHTMLResponse.js";
import nodeFetch from "node-fetch";
import { JSDOM } from "jsdom";

/**
 * Real Cheap Airport Parking Service Implementation
 *
 * Cheap Airport Parking provides budget-friendly airport parking options
 * through their website. The API returns HTML which needs to be parsed
 * to extract parking facility information.
 *
 * API Endpoint: https://www.cheapairportparking.org/parking/find.php
 * Parameters:
 * - airport: Airport code (e.g., "ORD", "LAX")
 * - FromDate: Date in MM/DD/YYYY format (URL encoded as MM%2FDD%2FYYYY)
 * - from_time: Hour in 24-hour format (0-23)
 * - ToDate: Date in MM/DD/YYYY format (URL encoded as MM%2FDD%2FYYYY)
 * - to_time: Hour in 24-hour format (0-23)
 */
export class CheapAirportParkingProvider implements ParkingProvider {
  private readonly baseUrl =
    "https://www.cheapairportparking.org/parking/find.php";
  
  // Batch size for fetching detail pages (to avoid rate limiting)
  private readonly detailPageBatchSize = 5;
  
  // Retry configuration for rate limiting
  private readonly maxRetries = 4;
  private readonly initialRetryDelay = 1000; // 1 second

  /**
   * Search for parking locations using the Cheap Airport Parking API
   */
  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    const startTimeISO = params.start_time.toISOString().split(".")[0];
    const endTimeISO = params.end_time.toISOString().split(".")[0];

    console.log("🔍 Cheap Airport Parking: Searching locations...", {
      airport: params.airport_code,
      dates: `${startTimeISO} to ${endTimeISO}`,
    });

    try {
      const rawResults = await this.fetchLocations(params);

      console.log(
        `📍 Cheap Airport Parking: Fetching address details for ${rawResults.length} locations in batches of ${this.detailPageBatchSize}...`
      );

      // Fetch address details in batches to balance speed and rate limiting
      const rawResultsWithAddresses = await this.fetchAddressesInBatches(
        rawResults,
        params
      );

      // Normalize all results to our common format
      const normalizedLocations = rawResultsWithAddresses.map((raw) =>
        normalizeLocation(raw, params)
      );

      console.log(
        `✅ Cheap Airport Parking: Found ${normalizedLocations.length} locations`
      );
      return normalizedLocations;
    } catch (error) {
      console.error(
        "❌ Cheap Airport Parking: Failed to search locations:",
        error
      );
      throw error;
    }
  }

  /**
   * Fetch locations from the Cheap Airport Parking API
   */
  private async fetchLocations(
    params: ApiSearchParams
  ): Promise<CheapAirportParkingRawLocation[]> {
    // Convert ISO datetime to the format expected by the API
    const { fromDate, fromTime, toDate, toTime } = this.convertDatesToAPIFormat(
      params.start_time,
      params.end_time
    );

    // Build the API URL with query parameters
    // Note: We manually encode the dates with %2F, so we need to build the URL string directly
    // rather than using URLSearchParams which would double-encode
    const baseUrl = `${this.baseUrl}?airport=${params.airport_code}&FromDate=${fromDate}&from_time=${fromTime}&ToDate=${toDate}&to_time=${toTime}`;

    console.log(`🌐 Cheap Airport Parking: Fetching from API: ${baseUrl}`);

    // Build cookies based on search parameters
    const formatCookieDate = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const cookies = [
      `airport=${params.airport_code}`,
      `_from=${formatCookieDate(
        params.start_time
      )}_${params.start_time.getHours()}`,
      `_to=${formatCookieDate(params.end_time)}_${params.end_time.getHours()}`,
      `id_visit=${Date.now()}`, // Use timestamp as visit ID
      `find=1`,
    ].join("; ");

    const response = await nodeFetch(baseUrl, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webeb,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "Sec-Ch-Ua":
          '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Cookie: cookies,
      },
      redirect: "follow", // Follow redirects
    });

    if (!response.ok) {
      throw new Error(
        `Cheap Airport Parking API request failed: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    console.log(
      `📄 Cheap Airport Parking: Retrieved HTML response (${html.length} characters)`
    );

    // Parse the HTML to extract parking locations
    const locations = parseHTMLResponse(html);

    console.log(
      `📊 Cheap Airport Parking: Parsed ${locations.length} locations`
    );

    return locations;
  }

  /**
   * Sleep for a specified duration
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    operation: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error (403)
        const is403 = error instanceof Error && error.message.includes("403");

        // If this was the last attempt or not a rate limit error, throw
        if (attempt === this.maxRetries || !is403) {
          throw error;
        }

        // Calculate exponential backoff delay with base 3 (1s, 3s, 9s)
        const delay = this.initialRetryDelay * Math.pow(3, attempt);
        console.warn(
          `⚠️  Rate limited (403) on ${operation}, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})...`
        );

        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error("Retry failed");
  }

  /**
   * Fetch addresses for multiple locations in batches
   */
  private async fetchAddressesInBatches(
    locations: CheapAirportParkingRawLocation[],
    params: ApiSearchParams
  ): Promise<CheapAirportParkingRawLocation[]> {
    const results: CheapAirportParkingRawLocation[] = [];
    
    // Process locations in batches
    for (let i = 0; i < locations.length; i += this.detailPageBatchSize) {
      const batch = locations.slice(i, i + this.detailPageBatchSize);
      const batchNumber = Math.floor(i / this.detailPageBatchSize) + 1;
      const totalBatches = Math.ceil(locations.length / this.detailPageBatchSize);
      
      console.log(
        `  📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} locations)...`
      );
      
      // Fetch addresses for all locations in this batch in parallel with retry
      const batchResults = await Promise.all(
        batch.map(async (raw) => {
          try {
            const address = await this.retryWithBackoff(
              () => this.fetchLocationAddress(raw, params),
              `detail page for ${raw.name}`
            );
            return { ...raw, address };
          } catch (error) {
            console.warn(
              `⚠️  Failed to fetch address for ${raw.name} after ${this.maxRetries} retries:`,
              error instanceof Error ? error.message : error
            );
            // Return without address if fetch fails after all retries
            return raw;
          }
        })
      );
      
      results.push(...batchResults);
      
      // Add a small delay between batches to be extra cautious
      if (i + this.detailPageBatchSize < locations.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  /**
   * Fetch detailed address information for a specific location
   */
  private async fetchLocationAddress(
    location: CheapAirportParkingRawLocation,
    params: ApiSearchParams
  ): Promise<{
    street: string;
    city: string;
    state: string;
    zip: string;
    full_address: string;
  }> {
    const detailUrl = "https://www.cheapairportparking.org/parking/lot.php";

    // Format dates for the detail page request (MM/DD/YYYY without URL encoding)
    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Build form data for POST request
    const formData = new URLSearchParams({
      id_park: location.park_id,
      id_lot: location.lot_id,
      date_from: formatDate(params.start_time),
      date_to: formatDate(params.end_time),
      time_from: String(params.start_time.getHours()),
      time_to: String(params.end_time.getHours()),
    });

    const response = await nodeFetch(detailUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
      body: formData.toString(),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `Detail page request failed: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    // Parse the address from schema.org markup
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

  /**
   * Convert Date objects to the format expected by the API
   */
  private convertDatesToAPIFormat(
    startTime: Date,
    endTime: Date
  ): {
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
  } {
    // Format: MM%2FDD%2FYYYY (URL-encoded slashes)
    const formatDate = (date: Date): string => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}%2F${day}%2F${year}`;
    };

    return {
      fromDate: formatDate(startTime),
      fromTime: String(startTime.getHours()),
      toDate: formatDate(endTime),
      toTime: String(endTime.getHours()),
    };
  }
}

export const cheapAirportParkingProvider = new CheapAirportParkingProvider();
