export interface ParkWhizAutocompleteResponse {
  autocomplete: Array<{
    id: string;
    result_type: string;
    full_name: string;
    short_name: string;
    coordinates: [number, number];
    slug?: string;
    slugs?: {
      parkwhiz: string;
      bestparking?: string;
    };
    city: string;
    state: string;
    country: string;
    timezone: string;
    place_id: string;
    must_resolve: boolean;
    score: number;
  }>;
  events?: Array<any>;
}
