import { ParkingLocation } from "../common/ParkingLocation";
import { ParkingProvider } from "../common/ParkingProvider";
import { ParkWhizLocation } from "./ParkWhizLocation";

/**
 * Normalize a ParkWhiz location to the common ParkingLocation format
 * Extracts data from the REAL ParkWhiz API format and includes availability dates
 */

export function normalizeLocation(
  rawLocation: ParkWhizLocation
): ParkingLocation {
  const locationData = rawLocation._embedded["pw:location"];

  // Extract coordinates from entrances array (real format)
  const entrance = locationData.entrances?.[0];
  const coordinates = entrance?.coordinates
    ? {
        latitude: entrance.coordinates[0],
        longitude: entrance.coordinates[1],
      }
    : undefined;

  // Extract amenities from purchase_options (real format)
  const amenitiesSet = new Set<string>();
  const purchaseOption = rawLocation.purchase_options?.[0];

  // Get earliest start and latest end from all purchase options for availability dates
  let earliestStart: string | undefined;
  let latestEnd: string | undefined;

  if (rawLocation.purchase_options && rawLocation.purchase_options.length > 0) {
    rawLocation.purchase_options.forEach((option) => {
      if (option.start_time) {
        if (!earliestStart || option.start_time < earliestStart) {
          earliestStart = option.start_time;
        }
      }
      if (option.end_time) {
        if (!latestEnd || option.end_time > latestEnd) {
          latestEnd = option.end_time;
        }
      }

      // Extract amenities from this purchase option
      if (option.amenities) {
        option.amenities.forEach((amenity) => {
          if (amenity.enabled && amenity.key) {
            amenitiesSet.add(amenity.key);
          }
        });
      }
    });
  }

  const amenities = Array.from(amenitiesSet);

  // Determine specific amenity flags
  const hasShuttle = amenities.some((a) => a.includes("shuttle"));
  const hasValet = amenities.some((a) => a.includes("valet"));
  const hasCovered =
    amenities.some((a) => a.includes("covered")) ||
    amenities.some((a) => a.includes("indoor")) ||
    locationData.location_type === "garage";

  // Calculate distance if available and round to 1 decimal place
  const distanceMiles = rawLocation.distance?.straight_line?.feet
    ? Math.round((rawLocation.distance.straight_line.feet / 5280) * 10) / 10
    : undefined;

  // Extract pricing from first purchase option
  const priceUSD = purchaseOption?.price?.USD
    ? parseFloat(purchaseOption.price.USD)
    : 0;

  return {
    provider_id: rawLocation.location_id,
    provider: ParkingProvider.PARKWHIZ,
    name: locationData.name || "Unknown Location",
    address: {
      street: locationData.address1 || "",
      city: locationData.city || "",
      state: locationData.state || "",
      zip: locationData.postal_code || "",
      full_address:
        `${locationData.address1}, ${locationData.city}, ${locationData.state} ${locationData.postal_code}`.trim(),
    },
    coordinates,
    distance_to_airport_miles: distanceMiles,
    pricing: {
      daily_rate: priceUSD,
      currency: "USD",
    },
    amenities,
    availability: true,
    available_from: earliestStart,
    available_until: latestEnd,
    shuttle_service: hasShuttle,
    valet_service: hasValet,
    covered_parking: hasCovered,
    provider_data: {
      location_type: locationData.location_type,
      description: locationData.description,
      purchase_options: rawLocation.purchase_options,
    },
  };
}
