import { CheapAirportParkingRawLocation } from "./CheapAirportParkingTypes.js";
import { JSDOM } from "jsdom";

/**
 * Parse HTML response from Cheap Airport Parking API
 * Extracts parking location data from the HTML structure
 */
export function parseHTMLResponse(
  html: string
): CheapAirportParkingRawLocation[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const locations: CheapAirportParkingRawLocation[] = [];

  // Find all listing divs - these contain the parking locations
  const listings = document.querySelectorAll(".listing");
  
  listings.forEach((element) => {
    // Skip if this is not a real listing (e.g., filter reset button)
    if (
      element.getAttribute("id") === "id_reset" ||
      element.classList.contains("listing-last")
    ) {
      return;
    }

    try {
      const location = parseListingElement(element as HTMLElement);
      if (location) {
        locations.push(location);
      }
    } catch (error) {
      console.warn("Failed to parse listing:", error);
    }
  });

  return locations;
}

/**
 * Parse a single listing element
 */
function parseListingElement(
  listing: HTMLElement
): CheapAirportParkingRawLocation | null {
  // Extract form data which contains IDs and pricing
  const form = listing.querySelector("form");
  if (!form) return null;

  const lot_id = form.querySelector<HTMLInputElement>('input[name="id_lot"]')?.value;
  const park_id = form.querySelector<HTMLInputElement>('input[name="id_park"]')?.value;

  if (!lot_id || !park_id) {
    return null;
  }

  // Extract name
  const nameElement = listing.querySelector(".lot-name");
  const name = nameElement?.textContent?.trim() || "";
  if (!name) {
    return null;
  }

  // Extract parking type
  const parkingTypeElement = listing.querySelector(".park-type");
  const parking_type = parkingTypeElement?.textContent?.trim() || "";

  // Extract coordinates from the gotoMap function call
  const mapDiv = listing.querySelector('div[onclick*="gotoMap"]');
  const onclickAttr = mapDiv?.getAttribute("onclick") || "";
  const coordsMatch = onclickAttr.match(
    /gotoMap\([^,]+,\s*\d+,\s*([-\d.]+),\s*([-\d.]+)/
  );
  const latitude = coordsMatch ? parseFloat(coordsMatch[1]) : 0;
  const longitude = coordsMatch ? parseFloat(coordsMatch[2]) : 0;

  // Extract pricing
  const priceElement = listing.querySelector(".dayrate");
  const priceText = priceElement?.textContent || "";
  let total_price: number | undefined;
  let daily_rate: number | undefined;

  // Look for price like "$26.95 total" or "$21"
  const totalPriceMatch = priceText.match(/\$?([\d.]+)\s*total/i);
  const dailyPriceMatch = priceText.match(/\$?([\d.]+)(?!\s*total)/);

  if (totalPriceMatch) {
    total_price = parseFloat(totalPriceMatch[1]);
  } else if (dailyPriceMatch) {
    daily_rate = parseFloat(dailyPriceMatch[1]);
  }

  // Check availability
  const availabilityText = form.parentElement?.textContent?.toLowerCase() || "";
  const is_available =
    !availabilityText.includes("not available") &&
    !availabilityText.includes("sold out") &&
    (total_price !== undefined || daily_rate !== undefined);

  let availability_message: string | undefined;
  if (availabilityText.includes("not available for")) {
    const match = availabilityText.match(/not available for[^<]*/i);
    availability_message = match ? match[0].trim() : "Not Available";
  } else if (availabilityText.includes("sold out")) {
    availability_message = "Sold Out";
  }

  // Extract rating
  const ratingElement = listing.querySelector("div[style*='font-size: 16px']");
  const ratingText = ratingElement?.textContent || "";
  const ratingMatch = ratingText.match(/(\d+)%/);
  const recommend_percentage = ratingMatch
    ? parseInt(ratingMatch[1], 10)
    : undefined;

  // Extract review count
  const reviewLink = listing.querySelector("a.mylink");
  const reviewText = reviewLink?.textContent || "";
  const reviewMatch = reviewText.match(/(\d+)\s+review/);
  const review_count = reviewMatch ? parseInt(reviewMatch[1], 10) : undefined;

  // Extract shuttle info
  const shuttleElement = listing.querySelector("div[style*='font-size: 14px']");
  const shuttle_info = shuttleElement?.textContent?.trim() || undefined;

  // Extract amenities from parking type and other info
  const amenities: string[] = [];
  const parkingTypeLower = parking_type.toLowerCase();

  if (parkingTypeLower.includes("shuttle") || shuttle_info) {
    amenities.push("shuttle");
  }
  if (parkingTypeLower.includes("valet")) {
    amenities.push("valet");
  }
  if (
    parkingTypeLower.includes("indoor") ||
    parkingTypeLower.includes("covered")
  ) {
    amenities.push("covered");
  }
  if (parkingTypeLower.includes("self")) {
    amenities.push("self-park");
  }

  // Extract image URL
  const img = listing.querySelector(".listing-left img");
  const image_url = img?.getAttribute("src") || undefined;

  return {
    lot_id,
    park_id,
    name,
    parking_type,
    latitude,
    longitude,
    total_price,
    daily_rate,
    is_available,
    availability_message,
    recommend_percentage,
    review_count,
    shuttle_info,
    amenities,
    image_url,
  };
}
