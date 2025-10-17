export interface SpotHeroMockLocation {
  id: number;
  name: string;
  description: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  distance: number; // in miles
  price: {
    amount: number;
    currency: "USD";
  };
  amenities: {
    covered: boolean;
    valet: boolean;
    handicap_accessible: boolean;
    electric_charging: boolean;
    shuttle: boolean;
  };
  available: boolean;
  // Availability date range
  available_from?: string; // ISO datetime
  available_until?: string; // ISO datetime
}
