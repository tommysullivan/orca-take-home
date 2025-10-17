import { Address } from "./Address";
import { Coordinates } from "./Coordinates";
import { ParkingProviderType } from "./ParkingProviderType";
import { Pricing } from "./Pricing";

export interface ParkingLocation {
  provider_id: string;
  provider: ParkingProviderType;
  name: string;
  address: Address;
  coordinates?: Coordinates;
  distance_to_airport_miles?: number;
  pricing: Pricing;
  amenities: string[];
  availability: boolean;
  // Availability date range - ISO datetime strings
  available_from?: string;
  available_until?: string;
  shuttle_service: boolean;
  valet_service: boolean;
  covered_parking: boolean;
  provider_data?: {
    [key: string]: any;
  };
}
