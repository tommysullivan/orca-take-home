import { ParkingLocation, ParkingProvider } from "../providers";
import { ParkWhizRealLocation } from "./parkwhiz-types";

/**
 * Normalize a ParkWhiz location to the standard ParkingLocation format
 * This function is shared between mock and real ParkWhiz services
 */
export function normalizeLocation(
  location: ParkWhizRealLocation
): ParkingLocation {
  const locationData = location._embedded["pw:location"];
  const firstPurchaseOption = location.purchase_options[0];

  // Extract amenity names from purchase_options (real API structure)
  const amenityNames: string[] = [];
  
  if (firstPurchaseOption.amenities) {
    firstPurchaseOption.amenities.forEach((amenity: any) => {
      // Only include enabled amenities
      if (amenity.enabled && amenity.name) {
        amenityNames.push(amenity.name.toLowerCase());
      }
    });
  }

  // Determine service features based on amenities
  const shuttleService = amenityNames.some(name => 
    name.includes("shuttle") || name.includes("free shuttle")
  );
  const valetService = amenityNames.some(name => 
    name.includes("valet")
  );
  const coveredParking = amenityNames.some(name => 
    name.includes("covered") || name.includes("indoor")
  ) || locationData.location_type === "garage";

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
      latitude: locationData.entrances?.[0]?.coordinates?.[0] || 0,
      longitude: locationData.entrances?.[0]?.coordinates?.[1] || 0,
    },
    distance_to_airport_miles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
    pricing: {
      daily_rate: dailyRate,
      currency: "USD",
    },
    amenities: amenityNames,
    availability: firstPurchaseOption.space_availability.status === "available",
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
