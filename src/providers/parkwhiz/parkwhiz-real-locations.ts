/**
 * Real ParkWhiz Location Retrieval Service
 * 
 * This service implements the actual ParkWhiz API scraping process as documented
 * in parkwhiz.md, following the multi-step process:
 * 1. Get bearer token from ParkWhiz homepage
 * 2. Call autocomplete API to get venue slug for airport code (with auth)
 * 3. Fetch HTML page using the slug
 * 4. Extract location data from window.__INITIAL_STATE__ in the HTML
 */

export interface ParkWhizAutocompleteResponse {
  autocomplete: Array<{
    id: string;
    result_type: string;
    full_name: string;
    short_name: string;
    coordinates: [number, number];
    slug?: string;
    slugs?: {
      parkwhiz: string;
      bestparking?: string;
    };
    city: string;
    state: string;
    country: string;
    timezone: string;
    place_id: string;
    must_resolve: boolean;
    score: number;
  }>;
  events?: Array<any>;
}

export interface ParkWhizRealLocation {
  location_id: string;
  type: string;
  start_time: string;
  end_time: string;
  min_start: string;
  max_end: string;
  distance: {
    straight_line: {
      meters: number;
      feet: number;
    };
  };
  purchase_options: Array<{
    id: string;
    start_time: string;
    end_time: string;
    min_start: string;
    max_end: string;
    base_price: { USD: string };
    price: { USD: string };
    display: { price: string };
    pricing_segments: Array<{
      id: number;
      start_time: string;
      end_time: string;
      event: any;
      space_availability: { status: string };
      pricing_type: string;
    }>;
    space_availability: { status: string };
    validation: {
      require_license_plate: boolean;
      display: { scan_code: string };
      validation_steps: Array<{
        instructions: string;
        icon: { path: string };
      }>;
    };
  }>;
  _embedded: {
    "pw:location": {
      id: string;
      name: string;
      description: string;
      address1: string;
      city: string;
      state: string;
      postal_code: string;
      coordinates: [number, number];
      location_type: string;
      amenities: Array<{
        id: string;
        name: string;
        display_name: string;
        icon_path: string;
      }>;
      images?: Array<any>;
      _embedded?: {
        "pw:seller"?: {
          id: string;
          name: string;
        };
      };
    };
  };
}

export interface ParkWhizInitialState {
  locations: ParkWhizRealLocation[];
  venue: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
    postal_code: string;
    coordinates: [number, number];
    timezone: string;
  };
  [key: string]: any;
}

/**
 * Real ParkWhiz Location Service
 * Implements the actual scraping process described in parkwhiz.md with bearer token authentication
 */
export class ParkWhizRealLocationService {
  private readonly autocompleteBaseUrl = "https://api.parkwhiz.com/internal/v1/autocomplete/";
  private readonly websiteBaseUrl = "https://www.parkwhiz.com";

  /**
   * Extract bearer token from ParkWhiz homepage
   */
  private async getBearerToken(): Promise<string> {
    const response = await fetch('https://www.parkwhiz.com/', {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ParkWhiz homepage: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract token from window.__INITIAL_STATE__.user.token
    // Find the start of the __INITIAL_STATE__ assignment
    const stateStart = html.indexOf('window.__INITIAL_STATE__=');
    
    if (stateStart === -1) {
      throw new Error('Could not find window.__INITIAL_STATE__ in homepage');
    }

    // Find the start of the JSON object
    const jsonStart = html.indexOf('{', stateStart);
    
    if (jsonStart === -1) {
      throw new Error('Could not find JSON start in __INITIAL_STATE__');
    }

    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let jsonEnd = jsonStart;
    
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === '{') {
        braceCount++;
      } else if (html[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }
    
    if (braceCount !== 0) {
      throw new Error('Could not find matching closing brace for __INITIAL_STATE__');
    }

    // Extract the JSON string
    const jsonString = html.substring(jsonStart, jsonEnd + 1);
    
    try {
      const initialState = JSON.parse(jsonString);
      const token = initialState?.user?.token;
      
      if (!token || typeof token !== 'string') {
        throw new Error('No valid token found in window.__INITIAL_STATE__.user.token');
      }

      console.log('✅ Bearer token extracted successfully');
      return token;
    } catch (parseError) {
      throw new Error(`Failed to parse initial state: ${parseError}`);
    }
  }

  /**
   * Get locations for a given airport code
   */
  async getLocationsForAirport(airportCode: string): Promise<ParkWhizRealLocation[]> {
    try {
      console.log(`🌐 ParkWhiz Real: Getting locations for ${airportCode}...`);

      // Step 1: Get bearer token
      console.log('🔐 Getting bearer token...');
      const bearerToken = await this.getBearerToken();
      console.log('✅ Bearer token obtained');

      // Step 2: Get airport venue data using authenticated autocomplete API
      const venues = await this.getAirportVenueDataWithAuth(airportCode, bearerToken);
      
      if (!venues || venues.length === 0) {
        throw new Error(`No airport venues found for ${airportCode}`);
      }

      const venue = venues[0]; // Take the first (best match) airport venue
      const slug = venue.slugs?.parkwhiz || `/search?place=${venue.place_id}`;

      console.log(`📍 Found venue: ${venue.full_name} with slug: ${slug}`);

      // Step 3: Extract locations from HTML page
      const locations = await this.extractLocationsFromHtml(slug);
      
      console.log(`✅ ParkWhiz Real: Retrieved ${locations.length} locations for ${airportCode}`);
      return locations;

    } catch (error) {
      console.error(`❌ ParkWhiz Real: Failed to get locations for ${airportCode}:`, error);
      throw error;
    }
  }

  /**
   * Step 1: Call autocomplete API with authentication to get venue data for airport
   */
  private async getAirportVenueDataWithAuth(airportCode: string, bearerToken: string): Promise<ParkWhizAutocompleteResponse['autocomplete']> {
    // Build autocomplete URL with minimal required parameters
    const params = new URLSearchParams({
      term: airportCode,
      results: '6',
      country: 'us,ca',
      cohort: 'control'
    });

    const url = `${this.autocompleteBaseUrl}?${params.toString()}`;
    
    console.log(`🌐 Calling authenticated autocomplete API: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `Bearer ${bearerToken}`,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Pragma': 'no-cache',
        'Referer': 'https://www.parkwhiz.com/',
        'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Autocomplete API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ParkWhizAutocompleteResponse;
    
    console.log(`📊 Autocomplete response: ${JSON.stringify(data, null, 2)}`);
    
    // Try multiple strategies to find airport-related results
    const autocompleteResults = data.autocomplete || [];
    
    // Strategy 1: Look for actual airport venues (result_type === 'venue' with enhanced_airport)
    let airportVenues = autocompleteResults.filter((result: any) => 
      result.result_type === 'venue' && 
      (result.enhanced_airport === true || result.full_name?.toLowerCase().includes('airport'))
    );
    
    // Strategy 2: If no venues, look for hubs that might be airports
    if (airportVenues.length === 0) {
      console.log('🔍 No airport venues found, trying hubs...');
      airportVenues = autocompleteResults.filter((result: any) => 
        result.result_type === 'hub' && 
        (result.full_name?.toLowerCase().includes('airport') ||
         result.full_name?.toLowerCase().includes(airportCode.toLowerCase()) ||
         result.short_name?.toLowerCase().includes(airportCode.toLowerCase()))
      );
    }
    
    // Strategy 3: If still no results, try any result that matches the airport code exactly
    if (airportVenues.length === 0) {
      console.log('🔍 No hub matches, trying exact matches...');
      airportVenues = autocompleteResults.filter((result: any) => 
        result.full_name?.toLowerCase() === airportCode.toLowerCase() ||
        result.short_name?.toLowerCase() === airportCode.toLowerCase() ||
        result.full_name?.toLowerCase().includes(airportCode.toLowerCase())
      );
    }

    console.log(`🔍 Found ${airportVenues.length} airport results out of ${autocompleteResults.length} total results`);

    return airportVenues;
  }

  /**
   * Step 2: Fetch HTML page and extract window.__INITIAL_STATE__
   */
  private async extractLocationsFromHtml(slug: string): Promise<ParkWhizRealLocation[]> {
    const url = `${this.websiteBaseUrl}${slug}`;
    
    console.log(`🌐 Fetching HTML page: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTML page request failed: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract window.__INITIAL_STATE__ from the HTML
    const initialState = this.extractInitialStateFromHtml(html);
    
    if (!initialState || !initialState.locations) {
      throw new Error('No location data found in HTML page');
    }

    return initialState.locations;
  }

  /**
   * Parse window.__INITIAL_STATE__ from HTML content
   */
  private extractInitialStateFromHtml(html: string): ParkWhizInitialState | null {
    try {
      // Find the start of the JSON object
      const jsonStart = html.indexOf('window.__INITIAL_STATE__=') + 'window.__INITIAL_STATE__='.length;
      if (jsonStart === -1 + 'window.__INITIAL_STATE__='.length) {
        console.warn('Could not find window.__INITIAL_STATE__ in HTML');
        return null;
      }

      // Look for the end of the script tag to limit our search
      const scriptEndIndex = html.indexOf('</script>', jsonStart);
      const searchLimit = scriptEndIndex !== -1 ? scriptEndIndex : html.length;

      // Use brace counting to find the end of the JSON object
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let inString = false;
      let escapeNext = false;

      for (let i = jsonStart; i < searchLimit; i++) {
        const char = html[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
      }

      if (braceCount !== 0) {
        throw new Error('Could not find the end of the JSON object - unmatched braces');
      }

      // Extract the JSON string
      const jsonString = html.substring(jsonStart, jsonEnd + 1);
      
      // Validate the JSON doesn't contain HTML tags (this would indicate parsing issues)
      if (jsonString.includes('<') || jsonString.includes('>')) {
        console.log('⚠️ Warning: JSON string contains HTML tags, this might indicate parsing issues');
        console.log('JSON length:', jsonString.length);
        console.log('First 200 chars:', jsonString.substring(0, 200));
        console.log('Last 200 chars:', jsonString.substring(jsonString.length - 200));
      }

      // Parse the JSON data
      const initialState: ParkWhizInitialState = JSON.parse(jsonString);
      
      console.log(`📊 Extracted initial state with ${initialState.locations?.length || 0} locations`);
      
      return initialState;
    } catch (error) {
      console.error('Error parsing window.__INITIAL_STATE__:', error);
      return null;
    }
  }

  /**
   * Test the connection and basic functionality
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Testing ParkWhiz Real API connection with authentication...');
      
      // Test bearer token retrieval
      const token = await this.getBearerToken();
      console.log('✅ Bearer token retrieved successfully');
      
      // Test autocomplete API with ORD and authentication
      const venues = await this.getAirportVenueDataWithAuth('ORD', token);
      
      if (venues && venues.length > 0) {
        console.log(`✅ ParkWhiz Real: Authenticated connection test successful - found ${venues.length} venues for ORD`);
        return true;
      } else {
        console.log('⚠️ ParkWhiz Real: Authenticated connection test returned no venues');
        return false;
      }
    } catch (error) {
      console.error('❌ ParkWhiz Real: Authenticated connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const parkWhizRealLocationService = new ParkWhizRealLocationService();