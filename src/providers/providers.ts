export enum ParkingProvider {
  PARKWHIZ = "parkwhiz",
  SPOTHERO = "spothero",
  CHEAP_AIRPORT_PARKING = "cheap_airport_parking",
}

export interface ApiSearchParams {
  airport_code: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip?: string;
  full_address: string;
}

export interface Pricing {
  daily_rate: number;
  hourly_rate?: number;
  currency: string;
}

export interface ParkingLocation {
  provider_id: string;
  provider: ParkingProvider;
  name: string;
  address: Address;
  coordinates?: Coordinates;
  airport_code?: string;
  distance_to_airport_miles?: number;
  pricing: Pricing;
  amenities: string[];
  availability: boolean;
  shuttle_service: boolean;
  valet_service: boolean;
  covered_parking: boolean;
  provider_data?: {
    [key: string]: any;
  };
}

export interface MatchedLocation {
  id: string;
  canonical_name: string;
  canonical_address: Address;
  coordinates?: Coordinates;
  airport_code?: string;
  locations: ParkingLocation[];
  confidence_score: number;
  match_reasons: string[];
}

export interface ParkingProviderService {
  searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]>;
}
