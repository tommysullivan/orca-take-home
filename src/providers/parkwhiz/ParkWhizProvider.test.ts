import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockBearerToken } from "./mock/mockBearerToken";
import { mockAutocompleteResponse } from "./mock/mockAutocompleteResponse";
import { mockOrdAutocompleteResponse } from "./mock/mockOrdAutocompleteResponse";
import { mockHtmlWithInitialState } from "./mock/mockHtmlWithInitialState";
import { mockOrdHtmlWithInitialState } from "./mock/mockOrdHtmlWithInitialState";
import { ParkingProviderType } from "../common/ParkingProviderType";
import { parkWhizProvider } from "./ParkWhizProvider";

describe("ParkWhiz Real Service with HTTP Mocks", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should extract bearer token from homepage", async () => {
    const mockHomepageHtml = `
      <html>
        <head><title>ParkWhiz</title></head>
        <body>
          <script>
            window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}","id":null}}
          </script>
        </body>
      </html>
    `;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHomepageHtml),
    } as Response);

    // Access the private method through type assertion
    const token = await (parkWhizProvider as any).getBearerToken();

    expect(token).toBe(mockBearerToken);
    expect(fetch).toHaveBeenCalledWith("https://www.parkwhiz.com/", {
      headers: expect.objectContaining({
        "User-Agent": expect.any(String),
      }),
    });
  });

  it("should get venue data from autocomplete API", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAutocompleteResponse),
    } as any);

    const venueData = await (
      parkWhizProvider as any
    ).getAirportVenueDataWithAuth("LAX", mockBearerToken);

    expect(venueData).toEqual({
      name: "LAX Airport",
      slug: "/lax-airport-parking/",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("autocomplete"),
      {
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockBearerToken}`,
          Accept: "application/json, text/plain, */*",
        }),
      }
    );
  });

  it("should extract locations from HTML page", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtmlWithInitialState),
    } as Response);

    const locations = await (parkWhizProvider as any).extractLocationsFromHtml(
      "/lax-airport-parking/"
    );

    expect(locations).toHaveLength(2);
    expect(locations[0]).toMatchObject({
      location_id: "12345",
      _embedded: {
        "pw:location": expect.objectContaining({
          name: "QuikPark LAX Garage",
          city: "Los Angeles",
        }),
      },
    });
    expect(locations[1]).toMatchObject({
      location_id: "67890",
      _embedded: {
        "pw:location": expect.objectContaining({
          name: "Embassy Suites LAX",
          city: "Los Angeles",
        }),
      },
    });
  });

  it("should complete full workflow for LAX with mocked responses", async () => {
    const homepageHtml = `<script>window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}"}}</script>`;

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(homepageHtml),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAutocompleteResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtmlWithInitialState),
      } as Response);

    const locations = await parkWhizProvider.searchLocations({
      airport_code: "LAX",
      start_time: new Date("2024-12-20T10:00:00"),
      end_time: new Date("2024-12-20T18:00:00"),
    });

    expect(locations).toHaveLength(2);

    // Check first location normalization
    const firstLocation = locations[0];
    expect(firstLocation).toMatchObject({
      provider: ParkingProviderType.PARKWHIZ,
      provider_id: "12345",
      name: "QuikPark LAX Garage",
      address: expect.objectContaining({
        street: "123 Airport Blvd",
        city: "Los Angeles",
        state: "CA",
        zip: "90045",
      }),
      coordinates: {
        latitude: 33.9425,
        longitude: -118.4081,
      },
      distance_to_airport_miles: 1.0, // 5280 feet = 1 mile
      pricing: {
        daily_rate: 24.0,
        currency: "USD",
      },
      shuttle_service: true,
      covered_parking: true,
      valet_service: false,
    });

    // Check second location normalization
    const secondLocation = locations[1];
    expect(secondLocation).toMatchObject({
      provider: ParkingProviderType.PARKWHIZ,
      provider_id: "67890",
      name: "Embassy Suites LAX",
      pricing: {
        daily_rate: 18.5,
        currency: "USD",
      },
      shuttle_service: true,
      valet_service: true,
      covered_parking: false, // lot type, not garage
      distance_to_airport_miles: 1.5, // 7920 feet = 1.5 miles
    });
  });

  it("should complete full workflow for ORD with mocked responses", async () => {
    const homepageHtml = `<script>window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}"}}</script>`;

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(homepageHtml),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrdAutocompleteResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockOrdHtmlWithInitialState),
      } as Response);

    const locations = await parkWhizProvider.searchLocations({
      airport_code: "ORD",
      start_time: new Date("2024-12-20T10:00:00"),
      end_time: new Date("2024-12-20T18:00:00"),
    });

    expect(locations).toHaveLength(1);

    const location = locations[0];
    expect(location).toMatchObject({
      provider: ParkingProviderType.PARKWHIZ,
      provider_id: "ord_001",
      name: "Chicago Airport Parking",
      address: expect.objectContaining({
        street: "789 Mannheim Rd",
        city: "Rosemont",
        state: "IL",
        zip: "60018",
      }),
      distance_to_airport_miles: 0.8, // 3960 feet ≈ 0.8 miles
      pricing: {
        daily_rate: 19.99,
        currency: "USD",
      },
      shuttle_service: true,
      covered_parking: true, // garage type
      valet_service: false,
    });
  });

  it("should handle HTTP errors gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    await expect(
      parkWhizProvider.searchLocations({
        airport_code: "LAX",
        start_time: new Date("2024-12-20T10:00:00"),
        end_time: new Date("2024-12-20T18:00:00"),
      })
    ).rejects.toThrow("Failed to fetch ParkWhiz homepage: 500");
  });

  it("should handle missing venue data", async () => {
    const homepageHtml = `<script>window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}"}}</script>`;
    const emptyAutocompleteResponse = { autocomplete: [] };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(homepageHtml),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emptyAutocompleteResponse),
      } as Response);

    const locations = await parkWhizProvider.searchLocations({
      airport_code: "INVALID",
      start_time: new Date("2024-12-20T10:00:00"),
      end_time: new Date("2024-12-20T18:00:00"),
    });

    expect(locations).toEqual([]);
  });

  it("should handle malformed HTML gracefully", async () => {
    const homepageHtml = `<script>window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}"}}</script>`;
    const malformedHtml = "<html><body>No initial state here!</body></html>";

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(homepageHtml),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAutocompleteResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(malformedHtml),
      } as Response);

    await expect(
      parkWhizProvider.searchLocations({
        airport_code: "LAX",
        start_time: new Date("2024-12-20T10:00:00"),
        end_time: new Date("2024-12-20T18:00:00"),
      })
    ).rejects.toThrow("Could not find window.__INITIAL_STATE__ in HTML");
  });

  it("should properly normalize different location types", async () => {
    const homepageHtml = `<script>window.__INITIAL_STATE__={"user":{"token":"${mockBearerToken}"}}</script>`;

    const htmlWithVariedLocations = `
      <script>
      window.__INITIAL_STATE__={
        "locations": [
          {
            "location_id": "garage_001", 
            "distance": { "straight_line": { "feet": 2640 } },
            "purchase_options": [{ 
              "start_time": "2024-12-20T08:00:00.000-08:00",
              "end_time": "2024-12-21T20:00:00.000-08:00",
              "price": { "USD": "30.00" }, 
              "space_availability": { "status": "available" },
              "amenities": [
                { "name": "Covered", "key": "indoor", "enabled": true, "visible": true },
                { "name": "Valet", "key": "valet", "enabled": true, "visible": true },
                { "name": "Shuttle", "key": "shuttle", "enabled": true, "visible": true }
              ]
            }],
            "_embedded": {
              "pw:location": {
                "name": "Premium Garage",
                "address1": "100 Premium St", 
                "city": "Los Angeles",
                "state": "CA",
                "postal_code": "90210",
                "location_type": "garage",
                "entrances": [
                  {
                    "coordinates": [34.0, -118.0]
                  }
                ]
              }
            }
          },
          {
            "location_id": "lot_001",
            "distance": { "straight_line": { "feet": 1320 } }, 
            "purchase_options": [{ 
              "start_time": "2024-12-20T08:00:00.000-08:00",
              "end_time": "2024-12-21T20:00:00.000-08:00",
              "price": { "USD": "15.00" }, 
              "space_availability": { "status": "available" },
              "amenities": [
                { "name": "Shuttle", "key": "shuttle", "enabled": true, "visible": true }
              ]
            }],
            "_embedded": {
              "pw:location": {
                "name": "Budget Lot",
                "address1": "200 Budget Ave",
                "city": "Los Angeles", 
                "state": "CA", 
                "postal_code": "90045",
                "location_type": "lot",
                "entrances": [
                  {
                    "coordinates": [33.95, -118.41]
                  }
                ]
              }
            }
          }
        ]
      }
      </script>
    `;

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(homepageHtml),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAutocompleteResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(htmlWithVariedLocations),
      } as Response);

    const locations = await parkWhizProvider.searchLocations({
      airport_code: "LAX",
      start_time: new Date("2024-12-20T10:00:00"),
      end_time: new Date("2024-12-20T18:00:00"),
    });

    expect(locations).toHaveLength(2);

    // Check garage location
    const garageLocation = locations.find(
      (l) => l.provider_id === "garage_001"
    );
    expect(garageLocation).toMatchObject({
      name: "Premium Garage",
      covered_parking: true, // garage type + covered amenity
      valet_service: true,
      shuttle_service: true,
      distance_to_airport_miles: 0.5, // 2640 feet = 0.5 miles
      pricing: { daily_rate: 30.0 },
    });

    // Check lot location
    const lotLocation = locations.find((l) => l.provider_id === "lot_001");
    expect(lotLocation).toMatchObject({
      name: "Budget Lot",
      covered_parking: false, // lot type, no covered amenity
      valet_service: false,
      shuttle_service: true,
      distance_to_airport_miles: 0.3, // 1320 feet = 0.25 miles, rounded to 0.3
      pricing: { daily_rate: 15.0 },
    });
  });
});
