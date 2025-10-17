import { LocationMatchingService } from "./LocationMatchingService";
import { MatchCriteria } from "./MatchCriteria";

// Export factory function for custom configurations

export function createLocationMatchingService(
  criteria?: MatchCriteria
): LocationMatchingService {
  return new LocationMatchingService(criteria);
}
