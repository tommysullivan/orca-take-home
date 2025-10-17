/**
 * Shared types for ParkWhiz API responses and data structures
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
