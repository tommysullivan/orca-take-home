import { Kysely } from "kysely";
import { DBTypesafe, dbTypesafe } from "../db/dbTypesafe";
import { DB } from "../db/types/database-generated";
import { cheapAirportParkingService } from "../providers/cheap-airport-parking-service";
import { parkWhizService } from "../providers/parkwhiz-service";
import {
  ApiSearchParams,
  MatchedLocation,
  ParkingLocation,
  ParkingProvider,
} from "../providers/providers";
import { spotHeroService } from "../providers/spothero-service";
import { locationMatchingService } from "../services/location-matching-service";

interface SearchResults {
  locations: ParkingLocation[];
  matches: MatchedLocation[];
  summary: {
    total_locations: number;
    providers_count: number;
    matches_found: number;
    search_duration_ms: number;
  };
}

/**
 * Parking Aggregation Service
 *
 * Main orchestrator that:
 * 1. Queries multiple parking providers
 * 2. Normalizes and stores data
 * 3. Performs location matching
 * 4. Provides unified search interface
 */
export class ParkingAggregationService {
  private db: DBTypesafe;
  private providers = {
    [ParkingProvider.PARKWHIZ]: parkWhizService,
    [ParkingProvider.SPOTHERO]: spotHeroService,
    [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingService,
  };

  constructor(db: DBTypesafe) {
    this.db = db;
  }

  /**
   * Search for parking across all providers and find matches
   */
  async searchParkingWithMatching(
    params: ApiSearchParams
  ): Promise<SearchResults> {
    const startTime = Date.now();

    console.log(`🔍 Starting parking search for ${params.airport_code}`);
    console.log(`📅 Date range: ${params.start_time} to ${params.end_time}`);

    // Test all provider connections
    await this.testProviderConnections();

    // Query all providers in parallel
    const providerPromises = Object.entries(this.providers).map(
      async ([providerName, service]) => {
        try {
          console.log(`\n📡 Querying ${providerName}...`);
          const locations = await service.searchLocations(params);
          console.log(
            `✅ ${providerName}: Found ${locations.length} locations`
          );
          return locations;
        } catch (error) {
          console.error(`❌ ${providerName} failed:`, error);
          return [];
        }
      }
    );

    const providerResults = await Promise.all(providerPromises);
    const allLocations = providerResults.flat();

    console.log(`\n📊 Total locations found: ${allLocations.length}`);

    // Store locations in database
    await this.storeLocations(allLocations, params);

    // Find matches across providers
    console.log("\n🔗 Finding location matches...");
    const matches = locationMatchingService.findMatches(allLocations);
    console.log(`✅ Found ${matches.length} potential matches`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    const results: SearchResults = {
      locations: allLocations,
      matches,
      summary: {
        total_locations: allLocations.length,
        providers_count: Object.keys(this.providers).length,
        matches_found: matches.length,
        search_duration_ms: duration,
      },
    };

    console.log(`\n🎉 Search completed in ${duration}ms`);
    this.printSummary(results);

    return results;
  }

  /**
   * Get historical data for an airport
   */
  async getHistoricalData(airportCode: string): Promise<{
    locations: any[];
    matches: any[];
  }> {
    const locations = await this.db
      .selectFrom("parking_locations")
      .selectAll()
      .where("airport_code", "=", airportCode)
      .orderBy("created_at", "desc")
      .execute();

    const matches = await this.db
      .selectFrom("location_matches")
      .selectAll()
      .where("airport_code", "=", airportCode)
      .orderBy("created_at", "desc")
      .execute();

    return { locations, matches };
  }

  private async testProviderConnections(): Promise<void> {
    console.log("\n🔗 Testing provider connections...");

    const connectionPromises = Object.entries(this.providers).map(
      async ([name, service]) => {
        const isConnected = await service.testConnection();
        return { name, isConnected };
      }
    );

    const results = await Promise.all(connectionPromises);
    const failedConnections = results.filter((r) => !r.isConnected);

    if (failedConnections.length > 0) {
      console.warn(
        `⚠️  Failed connections: ${failedConnections
          .map((r) => r.name)
          .join(", ")}`
      );
    }
  }

  private async storeLocations(
    locations: ParkingLocation[],
    searchParams: ApiSearchParams
  ): Promise<void> {
    console.log("\n💾 Storing locations in database...");

    for (const location of locations) {
      try {
        await this.db
          .insertInto("parking_locations")
          .values({
            provider_id: location.provider_id,
            provider: location.provider,
            name: location.name,
            address_street: location.address.street,
            address_city: location.address.city,
            address_state: location.address.state,
            address_zip: location.address.zip,
            address_full: location.address.full_address,
            latitude: location.coordinates?.latitude,
            longitude: location.coordinates?.longitude,
            airport_code: location.airport_code,
            distance_to_airport_miles: location.distance_to_airport_miles,
            daily_rate: location.pricing.daily_rate,
            hourly_rate: location.pricing.hourly_rate,
            currency: location.pricing.currency,
            amenities: JSON.stringify(location.amenities),
            availability: location.availability,
            shuttle_service: location.shuttle_service,
            valet_service: location.valet_service,
            covered_parking: location.covered_parking,
            provider_data: JSON.stringify(location.provider_data || {}),
            search_start_time: searchParams.start_time,
            search_end_time: searchParams.end_time,
            created_at: new Date().toISOString(),
          })
          .onConflict((oc: any) =>
            oc.columns(["provider", "provider_id"]).doUpdateSet({
              name: (eb: any) => eb.ref("excluded.name"),
              daily_rate: (eb: any) => eb.ref("excluded.daily_rate"),
              availability: (eb: any) => eb.ref("excluded.availability"),
              created_at: new Date().toISOString(),
            })
          )
          .execute();
      } catch (error) {
        console.error(
          `Failed to store location ${location.provider_id}:`,
          error
        );
      }
    }

    console.log(`✅ Stored ${locations.length} locations`);
  }

  private printSummary(results: SearchResults): void {
    console.log("\n📈 SEARCH SUMMARY");
    console.log("==================");
    console.log(`Total Locations: ${results.summary.total_locations}`);
    console.log(`Providers Queried: ${results.summary.providers_count}`);
    console.log(`Matches Found: ${results.summary.matches_found}`);
    console.log(`Search Duration: ${results.summary.search_duration_ms}ms`);

    if (results.matches.length > 0) {
      console.log("\n🔗 TOP MATCHES:");
      results.matches.slice(0, 3).forEach((match, index) => {
        console.log(`${index + 1}. ${match.canonical_name}`);
        console.log(
          `   Confidence: ${(match.confidence_score * 100).toFixed(1)}%`
        );
        console.log(
          `   Providers: ${match.locations.map((l) => l.provider).join(", ")}`
        );
        console.log(
          `   Price Range: $${Math.min(
            ...match.locations.map((l) => l.pricing.daily_rate)
          )} - $${Math.max(
            ...match.locations.map((l) => l.pricing.daily_rate)
          )}/day`
        );
      });
    }

    // Provider breakdown
    console.log("\n📊 BY PROVIDER:");
    const providerCounts = results.locations.reduce((acc, loc) => {
      acc[loc.provider] = (acc[loc.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(providerCounts).forEach(([provider, count]) => {
      console.log(`${provider}: ${count} locations`);
    });
  }

  /**
   * Generate detailed reports
   */
  async generateReports(matches: MatchedLocation[]): Promise<{
    matching_report: string;
    csv_export: string;
  }> {
    const matching_report =
      locationMatchingService.generateMatchingReport(matches);

    // Generate CSV for easy analysis
    const csvHeaders = [
      "Match ID",
      "Canonical Name",
      "Address",
      "Airport Code",
      "Confidence Score",
      "Provider Count",
      "ParkWhiz Price",
      "SpotHero Price",
      "Cheap Airport Parking Price",
      "Min Price",
      "Max Price",
      "Price Spread",
    ].join(",");

    const csvRows = matches.map((match) => {
      const prices = match.locations.reduce((acc, loc) => {
        acc[loc.provider] = loc.pricing.daily_rate;
        return acc;
      }, {} as Record<string, number>);

      const priceValues = Object.values(prices);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);

      return [
        match.id,
        `"${match.canonical_name}"`,
        `"${match.canonical_address.full_address}"`,
        match.airport_code || "",
        (match.confidence_score * 100).toFixed(1),
        match.locations.length,
        prices[ParkingProvider.PARKWHIZ] || "",
        prices[ParkingProvider.SPOTHERO] || "",
        prices[ParkingProvider.CHEAP_AIRPORT_PARKING] || "",
        minPrice.toFixed(2),
        maxPrice.toFixed(2),
        (maxPrice - minPrice).toFixed(2),
      ].join(",");
    });

    const csv_export = [csvHeaders, ...csvRows].join("\n");

    return {
      matching_report,
      csv_export,
    };
  }
}

export async function createParkingAggregationService(): Promise<ParkingAggregationService> {
  return new ParkingAggregationService(dbTypesafe);
}
