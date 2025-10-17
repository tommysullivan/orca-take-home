import { ApiSearchParams } from "./ApiSearchParams";
import { ParkingLocation } from "./ParkingLocation";

export interface ParkingProvider {
  searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]>;
}
