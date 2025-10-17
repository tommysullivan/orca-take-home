import {
  ApiSearchParams,
  ParkingLocation,
  ParkingProviderService,
} from "../providers";

/**
 * Common interface for all ParkWhiz service implementations
 * Both mock and real services must implement this interface
 */
export interface ParkWhizServiceInterface extends ParkingProviderService {
  searchLocations(params: ApiSearchParams): Promise<ParkingLocation[]>;
}
