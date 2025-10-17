import { ApiSearchParams } from "./ApiSearchParams";
import { ParkingLocation } from "./ParkingLocation";

export interface ParkingProviderService {
  searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]>;
}
