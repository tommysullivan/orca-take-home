import { ParkingLocation } from "./providers";

/**
 * Provider-agnostic date range filtering for normalized parking locations
 *
 * Filters locations based on their available_from and available_until dates
 * to match the requested search date range.
 */
export function filterLocationsByDateRange(
  locations: ParkingLocation[],
  requestedStart: string,
  requestedEnd: string
): ParkingLocation[] {
  const requestStart = new Date(requestedStart);
  const requestEnd = new Date(requestedEnd);

  return locations.filter((location) => {
    // If no date information, include the location (assume always available)
    if (!location.available_from || !location.available_until) {
      return true;
    }

    const locationStart = new Date(location.available_from);
    const locationEnd = new Date(location.available_until);

    // Check for date range overlap:
    // Location overlaps if it starts before/at requested end AND ends after/at requested start
    const hasOverlap = locationStart <= requestEnd && locationEnd >= requestStart;

    return hasOverlap;
  });
}
