import { Address } from "./Address";
import { Coordinates } from "./Coordinates";
import { ParkingLocation } from "./ParkingLocation";

export interface MatchedLocation {
  id: string;
  canonical_name: string;
  canonical_address: Address;
  coordinates?: Coordinates;
  locations: ParkingLocation[];
  confidence_score: number;
  match_reasons: string[];
}
