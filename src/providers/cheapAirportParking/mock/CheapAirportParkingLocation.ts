export interface CheapAirportParkingLocation {
  lot_id: string;
  lot_name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  location: {
    lat: number;
    lon: number;
  };
  airport: string;
  miles_from_airport: number;
  services: {
    shuttle_service: boolean;
    valet_parking: boolean;
    indoor_parking: boolean;
    security_patrol: boolean;
  };
  pricing: {
    daily_rate: number;
    weekly_rate?: number;
    currency: string;
  };
  availability: {
    spaces_available: number;
    total_spaces: number;
  };
  // Availability date range
  available_from?: string; // ISO datetime
  available_until?: string; // ISO datetime
}
