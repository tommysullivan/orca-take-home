/**
 * SpotHero API Response Types
 * Based on the actual API response structure from /v2/search/airport endpoint
 */

export interface SpotHeroSearchResponse {
  tracking: {
    action_id: string;
    search_id: string;
  };
  "@next": string;
  results: SpotHeroResult[];
}

export interface SpotHeroResult {
  distance: {
    linear_meters: number;
  };
  vehicle: any;
  rates: SpotHeroRate[];
  availability: {
    unavailable_reasons: string[];
    available_spaces: number;
    available: boolean;
  };
  facility: {
    airport?: SpotHeroAirportInfo;
    common: SpotHeroCommonFacilityInfo;
  };
}

export interface SpotHeroRate {
  airport?: {
    tag: string | null;
    comparisons: any;
    redemption_type: string;
    parking_pass: {
      type: string;
      display_name: string;
    };
    amenities: SpotHeroAmenity[];
    lowest_daily_rate: {
      currency_code: string;
      value: number; // in cents
    };
  };
  quote: {
    meta: {
      quote_mac: string;
      quote_valid_until: string;
      partner_id: string;
      quote_token: string;
    };
    total_price: {
      currency_code: string;
      value: number; // in cents
    };
    advertised_price: {
      currency_code: string;
      value: number; // in cents
    };
    order: Array<{
      meta: any;
      starts: string;
      ends: string;
      total_price: {
        currency_code: string;
        value: number;
      };
      facility_id: string;
      rate_id: string;
      items: Array<{
        type: string;
        short_description: string;
        full_description: string;
        price: {
          currency_code: string;
          value: number;
        };
      }>;
    }>;
    items: Array<{
      type: string;
      short_description: string;
      full_description: string;
      price: {
        currency_code: string;
        value: number;
      };
    }>;
  };
}

export interface SpotHeroAmenity {
  type: string;
  display_name: string;
  description: string;
}

export interface SpotHeroAirportInfo {
  logo?: {
    id: string;
    url: string;
    alt_text: string;
  };
  redemption_instructions?: any;
  transportation?: {
    type: string;
    contact_phone_number?: string;
    schedule?: {
      fast_frequency: number;
      slow_frequency: number;
      duration: number;
    };
    images?: Array<{
      id: string;
      url: string;
      alt_text: string;
    }>;
    hours_of_operation?: {
      periods: any[];
      text: string[];
      always_open: boolean;
    };
  };
}

export interface SpotHeroCommonFacilityInfo {
  vehicle_policy: {
    oversize_vehicle_policy: any;
    dimension_restrictions: any;
  };
  clearance_inches: number | null;
  status: string;
  title: string;
  slug: string;
  operator_display_name: string;
  id: string;
  description: string;
  barcode_type: string;
  facility_type: string;
  navigation_tip: string;
  images: Array<{
    id: string;
    url: string;
    alt_text: string;
  }>;
  supported_fee_types: string[];
  parking_types: string[];
  visual_flags: string[];
  fees: any[];
  addresses: SpotHeroAddress[];
  restrictions: string[];
  hours_of_operation: {
    periods: any[];
    text: string[];
    always_open: boolean;
  };
  cancellation: {
    allowed_by_customer: boolean;
    allowed_by_spothero_customer_service: boolean;
    minutes: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  inventory: {
    default_quantity: number;
  };
  operator_id: number;
  company_id: number;
  requirements: {
    printout: boolean;
    license_plate: boolean;
    phone_number: boolean;
  };
  oversize_fees_charged_onsite: boolean;
  allow_updating_reservation_after_entry: boolean;
  require_credit_card: boolean;
  is_scan_to_pay: boolean;
  is_part_of_loyalty_program: boolean;
  events: {
    allow_reservations_outside_hours_of_operations: boolean;
  };
  reservation_extension_enabled: boolean;
}

export interface SpotHeroAddress {
  id: string;
  city: string;
  state: string;
  street_address: string;
  time_zone: string;
  country: string;
  postal_code: string;
  types: string[];
  latitude: number;
  longitude: number;
}
