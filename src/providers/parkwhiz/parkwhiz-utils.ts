import { ParkingLocation, ParkingProvider } from "../providers";
import { ParkWhizRealLocation } from "./parkwhiz-types";

/**
 * Normalize a ParkWhiz location to the standard ParkingLocation format
 * This function is shared between mock and real ParkWhiz services
 */
export function normalizeLocation(location: ParkWhizRealLocation): ParkingLocation {
  const locationData = location._embedded["pw:location"];
  const firstPurchaseOption = location.purchase_options[0];

  // Extract amenity names for simple array
  const amenityNames = locationData.amenities.map((amenity) => amenity.name);

  // Determine service features based on amenities
  const shuttleService = amenityNames.includes("shuttle");
  const valetService = amenityNames.includes("valet");
  const coveredParking =
    amenityNames.includes("covered") ||
    locationData.location_type === "garage";

  // Convert distance from feet to miles
  const distanceMiles = location.distance.straight_line.feet / 5280;

  // Extract pricing from first purchase option
  const dailyRate = parseFloat(firstPurchaseOption.price.USD);

  return {
    provider_id: location.location_id,
    provider: ParkingProvider.PARKWHIZ,
    name: locationData.name,
    address: {
      street: locationData.address1,
      city: locationData.city,
      state: locationData.state,
      zip: locationData.postal_code,
      full_address:
        `${locationData.address1}, ${locationData.city}, ${locationData.state} ${locationData.postal_code}`.trim(),
    },
    coordinates: {
      latitude: locationData.coordinates[0],
      longitude: locationData.coordinates[1],
    },
    distance_to_airport_miles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
    pricing: {
      daily_rate: dailyRate,
      currency: "USD",
    },
    amenities: amenityNames,
    availability:
      firstPurchaseOption.space_availability.status === "available",
    shuttle_service: shuttleService,
    valet_service: valetService,
    covered_parking: coveredParking,
    provider_data: {
      location_type: locationData.location_type,
      description: locationData.description,
      purchase_options: location.purchase_options,
      original_data: location,
    },
  };
}