/**
 * Raw location data extracted from Cheap Airport Parking HTML response
 */
export interface CheapAirportParkingRawLocation {
  // Unique identifier for the parking location
  lot_id: string;
  // Identifier for the specific parking option/rate
  park_id: string;
  // Name of the parking facility
  name: string;
  // Parking type (e.g., "Indoor Self Parking", "Outdoor Valet", etc.)
  parking_type: string;
  // Geographic coordinates
  latitude: number;
  longitude: number;
  // Pricing information
  total_price?: number; // Total price for the entire stay
  daily_rate?: number; // Daily rate (if available)
  // Availability
  is_available: boolean;
  availability_message?: string; // e.g., "Not Available for less than 2 days", "Sold Out"
  // Customer rating (e.g., "91" for 91%)
  recommend_percentage?: number;
  // Number of reviews
  review_count?: number;
  // Amenities and services
  shuttle_info?: string; // e.g., "Free shuttle every 10-15 min"
  amenities: string[];
  // Image URL
  image_url?: string;
}
