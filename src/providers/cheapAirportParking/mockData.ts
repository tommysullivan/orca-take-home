import { CheapAirportParkingLocation } from "./CheapAirportParkingLocation";

export const mockData: CheapAirportParkingLocation[] = [
  // Chicago ORD Airport Data - Updated to match real ParkWhiz locations for better matching
  {
    lot_id: "cap_ord_001",
    available_from: "2024-12-20T06:00:00.000-06:00",
    available_until: "2024-12-22T23:59:00.000-06:00",
    lot_name: "Loews O'Hare Hotel Budget Lot",
    address: {
      street: "5274 N River Rd", // Very close to real ParkWhiz "5272 N. River Rd."
      city: "Rosemont",
      state: "IL",
      zip: "60018",
    },
    location: {
      lat: 41.9738,
      lon: -87.8626,
    },
    airport: "ORD",
    miles_from_airport: 0.4,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: true,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 18.99,
      weekly_rate: 113.94,
      currency: "USD",
    },
    availability: {
      spaces_available: 89,
      total_spaces: 200,
    },
  },
  {
    lot_id: "cap_ord_002",
    available_from: "2024-12-20T06:00:00.000-06:00",
    available_until: "2024-12-22T23:59:00.000-06:00",
    lot_name: "Easy Parking ORD Economy",
    address: {
      street: "3998 N Mannheim Rd", // Very close to real ParkWhiz "4000 N. Mannheim Rd."
      city: "Franklin Park",
      state: "IL",
      zip: "60131",
    },
    location: {
      lat: 41.9518,
      lon: -87.8857,
    },
    airport: "ORD",
    miles_from_airport: 1.9,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 13.95,
      weekly_rate: 83.7,
      currency: "USD",
    },
    availability: {
      spaces_available: 156,
      total_spaces: 300,
    },
  },
  {
    lot_id: "cap_ord_003",
    available_from: "2024-12-20T06:00:00.000-06:00",
    available_until: "2024-12-22T23:59:00.000-06:00",
    lot_name: "River Road Budget Parking",
    address: {
      street: "5268 N River Rd", // Close to real locations on River Rd
      city: "Rosemont",
      state: "IL",
      zip: "60018",
    },
    location: {
      lat: 41.9751,
      lon: -87.8741,
    },
    airport: "ORD",
    miles_from_airport: 0.8,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 15.5,
      weekly_rate: 93.0,
      currency: "USD",
    },
    availability: {
      spaces_available: 67,
      total_spaces: 150,
    },
  },
  {
    lot_id: "cap_ord_004",
    available_from: "2024-12-20T06:00:00.000-06:00",
    available_until: "2024-12-22T23:59:00.000-06:00",
    lot_name: "Loews O'Hare Budget Garage",
    address: {
      street: "5272 N River Rd", // Exact match to real ParkWhiz "5272 N. River Rd."
      city: "Rosemont",
      state: "IL",
      zip: "60018",
    },
    location: {
      lat: 41.9739,
      lon: -87.8625,
    },
    airport: "ORD",
    miles_from_airport: 0.4,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: true,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 19.99,
      weekly_rate: 119.94,
      currency: "USD",
    },
    availability: {
      spaces_available: 112,
      total_spaces: 200,
    },
  },
  // Los Angeles LAX Airport Data - Updated to match real ParkWhiz locations
  {
    lot_id: "cap_lax_001",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "QuikPark LAX Budget",
    address: {
      street: "9819 Vicksburg Ave", // Very close to real ParkWhiz "9821 Vicksburg Ave."
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
    },
    location: {
      lat: 33.9463,
      lon: -118.3944,
    },
    airport: "LAX",
    miles_from_airport: 0.8,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 22.95,
      weekly_rate: 137.7,
      currency: "USD",
    },
    availability: {
      spaces_available: 234,
      total_spaces: 400,
    },
  },
  {
    lot_id: "cap_lax_002",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "Embassy Suites Economy LAX",
    address: {
      street: "1438 E Imperial Ave", // Very close to real ParkWhiz "1440 E. Imperial Ave."
      city: "El Segundo",
      state: "CA",
      zip: "90245",
    },
    location: {
      lat: 33.9307,
      lon: -118.4009,
    },
    airport: "LAX",
    miles_from_airport: 0.9,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 11.5,
      weekly_rate: 69.0,
      currency: "USD",
    },
    availability: {
      spaces_available: 123,
      total_spaces: 250,
    },
  },
  {
    lot_id: "cap_lax_003",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "Joe's Budget Airport Parking",
    address: {
      street: "6149 W Century Blvd", // Very close to real ParkWhiz "6151 W. Century Blvd."
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
    },
    location: {
      lat: 33.9456,
      lon: -118.3926,
    },
    airport: "LAX",
    miles_from_airport: 0.9,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 16.99,
      weekly_rate: 101.94,
      currency: "USD",
    },
    availability: {
      spaces_available: 89,
      total_spaces: 180,
    },
  },
  {
    lot_id: "cap_lax_004",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "Sheraton Gateway Budget LAX",
    address: {
      street: "6103 W Century Blvd", // Very close to real ParkWhiz "6101 W. Century Blvd."
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
    },
    location: {
      lat: 33.946,
      lon: -118.3901,
    },
    airport: "LAX",
    miles_from_airport: 1.0,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 18.5,
      weekly_rate: 111.0,
      currency: "USD",
    },
    availability: {
      spaces_available: 145,
      total_spaces: 250,
    },
  },
  {
    lot_id: "cap_lax_005",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "Pacific Coast Budget Garage",
    address: {
      street: "911 N Pacific Coast Hwy", // Very close to real ParkWhiz "909 N. Pacific Coast Hwy."
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
    },
    location: {
      lat: 33.9301,
      lon: -118.3965,
    },
    airport: "LAX",
    miles_from_airport: 1.1,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: true,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 8.95,
      weekly_rate: 53.7,
      currency: "USD",
    },
    availability: {
      spaces_available: 203,
      total_spaces: 320,
    },
  },
  {
    lot_id: "cap_lax_006",
    available_from: "2024-12-20T06:00:00.000-08:00",
    available_until: "2024-12-22T23:59:00.000-08:00",
    lot_name: "WallyPark LAX Budget",
    address: {
      street: "9702 Bellanca Ave", // Very close to real ParkWhiz "9700 Bellanca Ave."
      city: "Los Angeles",
      state: "CA",
      zip: "90045",
    },
    location: {
      lat: 33.9384,
      lon: -118.4088,
    },
    airport: "LAX",
    miles_from_airport: 0.7,
    services: {
      shuttle_service: true,
      valet_parking: false,
      indoor_parking: false,
      security_patrol: true,
    },
    pricing: {
      daily_rate: 26.99,
      weekly_rate: 161.94,
      currency: "USD",
    },
    availability: {
      spaces_available: 78,
      total_spaces: 150,
    },
  },
];
