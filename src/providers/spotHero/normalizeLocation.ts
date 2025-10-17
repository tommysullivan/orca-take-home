import { ParkingLocation } from "../common/ParkingLocation";
import { ParkingProviderType } from "../common/ParkingProviderType";
import { SpotHeroResult } from "./SpotHeroTypes";

/**
 * Normalize a SpotHero result into our common ParkingLocation format
 */
export function normalizeLocation(result: SpotHeroResult): ParkingLocation {
  const facility = result.facility.common;
  const primaryRate = result.rates[0]; // Use the first rate (typically the best available)

  // Find the primary address (usually the one with 'search' or 'physical' type)
  const primaryAddress =
    facility.addresses.find(
      (addr) => addr.types.includes("search") || addr.types.includes("physical")
    ) || facility.addresses[0];

  // Extract amenities from the rate's airport info
  const amenityTypes = primaryRate.airport?.amenities.map((a) => a.type) || [];

  // Calculate daily rate from the quote
  // SpotHero returns prices in cents
  const totalPrice = primaryRate.quote.total_price.value / 100; // Convert cents to dollars
  const orderItem = primaryRate.quote.order[0];
  const starts = new Date(orderItem.starts);
  const ends = new Date(orderItem.ends);
  const durationDays = Math.ceil(
    (ends.getTime() - starts.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dailyRate = durationDays > 0 ? totalPrice / durationDays : totalPrice;

  // Distance from linear_meters to miles
  const distanceMiles = result.distance.linear_meters * 0.000621371;

  return {
    provider_id: facility.id,
    provider: ParkingProviderType.SPOTHERO,
    name: facility.title,
    address: {
      street: primaryAddress.street_address,
      city: primaryAddress.city,
      state: primaryAddress.state,
      zip: primaryAddress.postal_code,
      full_address: `${primaryAddress.street_address}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`,
    },
    coordinates: {
      latitude: primaryAddress.latitude,
      longitude: primaryAddress.longitude,
    },
    distance_to_airport_miles: distanceMiles,
    pricing: {
      daily_rate: dailyRate,
      currency: primaryRate.quote.total_price.currency_code,
    },
    amenities: amenityTypes,
    availability: result.availability.available,
    available_from: orderItem.starts,
    available_until: orderItem.ends,
    shuttle_service: amenityTypes.includes("shuttle"),
    valet_service: amenityTypes.includes("valet"),
    covered_parking:
      amenityTypes.includes("covered") || facility.facility_type === "garage",
    provider_data: {
      slug: facility.slug,
      operator_display_name: facility.operator_display_name,
      description: facility.description,
      navigation_tip: facility.navigation_tip,
      rating: facility.rating,
      restrictions: facility.restrictions,
      cancellation: facility.cancellation,
      redemption_type: primaryRate.airport?.redemption_type,
      parking_pass_type: primaryRate.airport?.parking_pass.type,
      available_spaces: result.availability.available_spaces,
      lowest_daily_rate: primaryRate.airport?.lowest_daily_rate
        ? primaryRate.airport.lowest_daily_rate.value / 100
        : undefined,
      original_data: result,
    },
  };
}
