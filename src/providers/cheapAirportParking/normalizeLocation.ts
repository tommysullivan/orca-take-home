import { ParkingLocation } from "../common/ParkingLocation.js";
import { ParkingProviderType } from "../common/ParkingProviderType.js";
import { CheapAirportParkingRawLocation } from "./CheapAirportParkingRawLocation.js";
import { ApiSearchParams } from "../common/ApiSearchParams.js";

/**
 * Normalize a Cheap Airport Parking location to our common format
 */
export function normalizeLocation(
  raw: CheapAirportParkingRawLocation,
  params: ApiSearchParams
): ParkingLocation {
  // Calculate daily rate if we only have total price
  let daily_rate = raw.daily_rate;
  if (!daily_rate && raw.total_price) {
    // Calculate number of days between start and end
    const startDate = new Date(params.start_time);
    const endDate = new Date(params.end_time);
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    daily_rate = days > 0 ? raw.total_price / days : raw.total_price;
  }

  // Default to 0 if no pricing available
  daily_rate = daily_rate || 0;

  // Determine amenity flags
  const shuttle_service = raw.amenities.includes("shuttle");
  const valet_service = raw.amenities.includes("valet");
  const covered_parking = raw.amenities.includes("covered");

  // Build amenities list
  const amenities: string[] = [...raw.amenities];
  if (raw.shuttle_info) {
    // Add shuttle frequency info if not already in amenities
    if (!amenities.includes("shuttle")) {
      amenities.push("shuttle");
    }
  }

  return {
    provider_id: raw.park_id,
    provider: ParkingProviderType.CHEAP_AIRPORT_PARKING,
    name: raw.name,
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      full_address: "", // Cheap Airport Parking doesn't provide address in the listing
    },
    coordinates:
      raw.latitude && raw.longitude
        ? {
            latitude: raw.latitude,
            longitude: raw.longitude,
          }
        : undefined,
    distance_to_airport_miles: undefined, // Not provided in the HTML response
    pricing: {
      daily_rate,
      currency: "USD",
    },
    amenities,
    availability: raw.is_available,
    available_from: isNaN(params.start_time.getTime()) ? new Date().toISOString() : params.start_time.toISOString(),
    available_until: isNaN(params.end_time.getTime()) ? new Date().toISOString() : params.end_time.toISOString(),
    shuttle_service,
    valet_service,
    covered_parking,
    provider_data: {
      lot_id: raw.lot_id,
      park_id: raw.park_id,
      parking_type: raw.parking_type,
      total_price: raw.total_price,
      recommend_percentage: raw.recommend_percentage,
      review_count: raw.review_count,
      shuttle_info: raw.shuttle_info,
      availability_message: raw.availability_message,
      image_url: raw.image_url,
      original_data: raw,
    },
  };
}
