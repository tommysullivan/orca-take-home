import {
  ParkingLocation,
  ParkingProvider,
  ApiSearchParams,
  ParkingProviderService,
} from "../providers";
import {
  ParkWhizAutocompleteResponse,
  ParkWhizRealLocation,
  ParkWhizInitialState,
} from "./parkwhiz-types";

/**
 * Real ParkWhiz Service Implementation
 *
 * This service implements the actual ParkWhiz API scraping process as documented
 * in parkwhiz.md, following the multi-step process:
 * 1. Get bearer token from ParkWhiz homepage
 * 2. Call autocomplete API to get venue slug for airport code (with auth)
 * 3. Fetch HTML page using the slug
 * 4. Extract location data from window.__INITIAL_STATE__ in the HTML
 */
export class RealParkWhizService implements ParkingProviderService {
  private readonly autocompleteBaseUrl =
    "https://api.parkwhiz.com/internal/v1/autocomplete/";
  private readonly websiteBaseUrl = "https://www.parkwhiz.com";

  /**
   * Search for parking locations using real ParkWhiz API
   */
  async searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]> {
    console.log("🔍 ParkWhiz Real: Searching locations...", {
      airport: params.airport_code,
      dates: `${params.start_time} to ${params.end_time}`,
    });

    const locations = await this.getLocationsForAirport(params.airport_code);
    return locations.map((location) => this.normalizeLocation(location));
  }

  /**
   * Get locations for a given airport code
   */
  async getLocationsForAirport(
    airportCode: string
  ): Promise<ParkWhizRealLocation[]> {
    console.log(`🌐 ParkWhiz Real: Getting locations for ${airportCode}...`);

    try {
      // Step 1: Get bearer token from homepage
      const bearerToken = await this.getBearerToken();
      console.log("✅ Bearer token obtained");

      // Step 2: Get venue data using authenticated autocomplete API
      const venueData = await this.getAirportVenueDataWithAuth(
        airportCode,
        bearerToken
      );
      if (!venueData) {
        console.log(`❌ No venue found for airport code: ${airportCode}`);
        return [];
      }

      console.log(
        `📍 Found venue: ${venueData.name} with slug: ${venueData.slug}`
      );

      // Step 3: Extract locations from HTML page
      const locations = await this.extractLocationsFromHtml(venueData.slug);
      console.log(
        `✅ ParkWhiz Real: Retrieved ${locations.length} locations for ${airportCode}`
      );

      return locations;
    } catch (error) {
      console.error(
        `❌ ParkWhiz Real: Failed to get locations for ${airportCode}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Extract bearer token from ParkWhiz homepage
   */
  private async getBearerToken(): Promise<string> {
    console.log("🔐 Getting bearer token...");

    const response = await fetch("https://www.parkwhiz.com/", {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ParkWhiz homepage: ${response.status}`);
    }

    const html = await response.text();

    // Extract token from window.__INITIAL_STATE__.user.token
    // Find the start of the __INITIAL_STATE__ assignment
    const stateStart = html.indexOf("window.__INITIAL_STATE__=");

    if (stateStart === -1) {
      throw new Error("Could not find window.__INITIAL_STATE__ in homepage");
    }

    // Find the start of the JSON object
    const jsonStart = html.indexOf("{", stateStart);

    if (jsonStart === -1) {
      throw new Error("Could not find JSON start in __INITIAL_STATE__");
    }

    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let jsonEnd = jsonStart;

    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") {
        braceCount++;
      } else if (html[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }

    if (braceCount !== 0) {
      throw new Error(
        "Could not find matching closing brace for __INITIAL_STATE__"
      );
    }

    // Extract the JSON string
    const jsonString = html.substring(jsonStart, jsonEnd + 1);

    try {
      const initialState = JSON.parse(jsonString);
      const token = initialState?.user?.token;

      if (!token || typeof token !== "string") {
        throw new Error(
          "No valid token found in window.__INITIAL_STATE__.user.token"
        );
      }

      console.log("✅ Bearer token extracted successfully");
      return token;
    } catch (parseError) {
      throw new Error(`Failed to parse initial state: ${parseError}`);
    }
  }

  /**
   * Get airport venue data using authenticated autocomplete API
   */
  private async getAirportVenueDataWithAuth(
    airportCode: string,
    bearerToken: string
  ): Promise<{ name: string; slug: string } | null> {
    const url = `${this.autocompleteBaseUrl}?term=${airportCode}&results=6&country=us%2Cca&cohort=control`;

    console.log(`🌐 Calling authenticated autocomplete API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Authorization: `Bearer ${bearerToken}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Autocomplete API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as ParkWhizAutocompleteResponse;

    console.log("📊 Autocomplete response:", JSON.stringify(data, null, 2));

    if (!data.autocomplete || data.autocomplete.length === 0) {
      console.log("❌ No autocomplete results found");
      return null;
    }

    // Count airport-related results
    const airportResults = data.autocomplete.filter((result) => {
      if (result.result_type === "venue") {
        const nameLower = result.full_name.toLowerCase();
        return nameLower.includes("airport");
      }
      return false;
    });

    console.log(
      `🔍 Found ${airportResults.length} airport results out of ${data.autocomplete.length} total results`
    );

    // Strategy 1: Look for venues (airports) first
    const venueResults = data.autocomplete.filter(
      (result) => result.result_type === "venue"
    );
    for (const result of venueResults) {
      const nameLower = result.full_name.toLowerCase();
      if (nameLower.includes("airport") && result.slug) {
        return {
          name: result.full_name,
          slug: result.slug,
        };
      }
    }

    // Strategy 2: Look for hub results that might be airports
    console.log("🔍 No airport venues found, trying hubs...");
    const hubResults = data.autocomplete.filter(
      (result) => result.result_type === "hub"
    );
    for (const result of hubResults) {
      const nameLower = result.full_name.toLowerCase();
      if (
        (nameLower.includes("airport") ||
          nameLower.includes(airportCode.toLowerCase())) &&
        result.slug
      ) {
        return {
          name: result.full_name,
          slug: result.slug,
        };
      }
    }

    // Strategy 3: Fallback - try exact name matches or close matches
    console.log("🔍 No hub matches, trying exact matches...");
    for (const result of data.autocomplete) {
      const nameLower = result.full_name.toLowerCase();
      const codeMatch = nameLower.includes(airportCode.toLowerCase());

      if (
        codeMatch ||
        result.short_name.toLowerCase().includes(airportCode.toLowerCase())
      ) {
        // For places, we need to construct a search URL
        if (result.result_type === "place" && result.place_id) {
          return {
            name: result.full_name,
            slug: `/search?place=${result.place_id}`,
          };
        } else if (result.slug) {
          return {
            name: result.full_name,
            slug: result.slug,
          };
        }
      }
    }

    console.log("❌ No suitable venue found in autocomplete results");
    return null;
  }

  /**
   * Extract locations from venue HTML page
   */
  private async extractLocationsFromHtml(
    slug: string
  ): Promise<ParkWhizRealLocation[]> {
    const url = `${this.websiteBaseUrl}${slug}`;
    console.log(`🌐 Fetching HTML page: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTML page request failed: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();
    const initialState = this.extractInitialStateFromHtml(html);

    if (!initialState.locations || !Array.isArray(initialState.locations)) {
      console.log("❌ No locations found in initial state");
      return [];
    }

    console.log(
      `📊 Extracted initial state with ${initialState.locations.length} locations`
    );
    return initialState.locations;
  }

  /**
   * Extract and parse __INITIAL_STATE__ from HTML
   */
  private extractInitialStateFromHtml(html: string): ParkWhizInitialState {
    // Find the script tag containing __INITIAL_STATE__
    const stateStart = html.indexOf("window.__INITIAL_STATE__=");
    if (stateStart === -1) {
      throw new Error("Could not find window.__INITIAL_STATE__ in HTML");
    }

    // Find the start of the JSON object
    const jsonStart = html.indexOf("{", stateStart);
    if (jsonStart === -1) {
      throw new Error("Could not find JSON start in __INITIAL_STATE__");
    }

    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let jsonEnd = jsonStart;
    let inString = false;
    let escapeNext = false;

    for (let i = jsonStart; i < html.length; i++) {
      const char = html[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          braceCount++;
        } else if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
    }

    if (braceCount !== 0) {
      throw new Error(
        "Could not find matching closing brace for __INITIAL_STATE__"
      );
    }

    // Extract the JSON string
    const jsonString = html.substring(jsonStart, jsonEnd + 1);

    // Log some debug info about the JSON
    const hasHtmlTags = /<[^>]+>/.test(jsonString);
    if (hasHtmlTags) {
      console.log(
        "⚠️ Warning: JSON string contains HTML tags, this might indicate parsing issues"
      );
    }

    console.log(`JSON length: ${jsonString.length}`);
    console.log(`First 200 chars: ${jsonString.substring(0, 200)}`);
    console.log(
      `Last 200 chars: ${jsonString.substring(
        Math.max(0, jsonString.length - 200)
      )}`
    );

    try {
      const initialState: ParkWhizInitialState = JSON.parse(jsonString);
      return initialState;
    } catch (parseError) {
      console.log("❌ Failed to parse JSON, attempting cleanup...");
      throw new Error(`Failed to parse initial state JSON: ${parseError}`);
    }
  }

  /**
   * Normalize a ParkWhizRealLocation to ParkingLocation format
   */
  private normalizeLocation(location: ParkWhizRealLocation): ParkingLocation {
    const locationData = location._embedded["pw:location"];
    const firstPurchaseOption = location.purchase_options[0];

    // Extract amenity names for simple array
    const amenityNames = locationData.amenities.map((amenity) => amenity.name);

    // Determine service features based on amenities
    const shuttleService = amenityNames.includes("shuttle");
    const valetService = amenityNames.includes("valet");
    const coveredParking =
      amenityNames.includes("covered") ||
      locationData.location_type === "garage";

    // Convert distance from feet to miles
    const distanceMiles = location.distance.straight_line.feet / 5280;

    // Extract pricing from first purchase option
    const dailyRate = parseFloat(firstPurchaseOption.price.USD);

    return {
      provider_id: location.location_id,
      provider: ParkingProvider.PARKWHIZ,
      name: locationData.name,
      address: {
        street: locationData.address1,
        city: locationData.city,
        state: locationData.state,
        zip: locationData.postal_code,
        full_address:
          `${locationData.address1}, ${locationData.city}, ${locationData.state} ${locationData.postal_code}`.trim(),
      },
      coordinates: {
        latitude: locationData.coordinates[0],
        longitude: locationData.coordinates[1],
      },
      airport_code: this.inferAirportCode(locationData.city, locationData.name),
      distance_to_airport_miles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
      pricing: {
        daily_rate: dailyRate,
        currency: "USD",
      },
      amenities: amenityNames,
      availability:
        firstPurchaseOption.space_availability.status === "available",
      shuttle_service: shuttleService,
      valet_service: valetService,
      covered_parking: coveredParking,
      provider_data: {
        location_type: locationData.location_type,
        description: locationData.description,
        purchase_options: location.purchase_options,
        original_data: location,
      },
    };
  }

  /**
   * Infer airport code from location data
   */
  private inferAirportCode(city: string, name: string): string | undefined {
    const cityLower = city.toLowerCase();
    const nameLower = name.toLowerCase();

    if (
      cityLower.includes("chicago") ||
      cityLower.includes("rosemont") ||
      nameLower.includes("o'hare")
    ) {
      return "ORD";
    }
    if (cityLower.includes("los angeles") || nameLower.includes("lax")) {
      return "LAX";
    }
    return undefined;
  }
}

export const realParkWhizService = new RealParkWhizService();
