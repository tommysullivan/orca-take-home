import { ParkWhizLocation } from "./ParkWhizLocation";

export interface ParkWhizInitialState {
  locations: ParkWhizLocation[];
  venue: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
    postal_code: string;
    coordinates: [number, number];
    timezone: string;
  };
  [key: string]: any;
}
