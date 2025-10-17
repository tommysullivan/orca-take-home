import { ParkingProvider } from "../common/ParkingProvider.js";
import { ParkingLocation } from "../common/ParkingLocation.js";
import { ApiSearchParams } from "../common/ApiSearchParams.js";
import { CheapAirportParkingRawLocation } from "./CheapAirportParkingRawLocation.js";
import { normalizeLocation } from "./normalizeLocation.js";
import { parseHTMLResponse } from "./parseHTMLResponse.js";
import nodeFetch from "node-fetch";

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

      // Normalize all results to our common format
      const normalizedLocations = rawResults.map((raw) =>
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
