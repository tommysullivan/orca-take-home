import {
  ParkingLocation,
  MatchedLocation,
  Coordinates,
} from "../providers/providers";

interface MatchCriteria {
  // Name similarity thresholds
  minimum_name_similarity: number;
  strong_name_similarity: number;

  // Address matching thresholds
  minimum_address_similarity: number;
  strong_address_similarity: number;

  // Geographic distance limits
  maximum_distance_meters: number;
  same_location_distance_meters: number;

  // Price correlation limits
  maximum_price_difference_ratio: number;
  consider_price_in_matching: boolean;

  // Confidence scoring weights
  base_confidence_score: number;
  provider_count_bonus: number;
  coordinate_data_bonus: number;
  complete_address_bonus: number;
  same_address_bonus: number;

  // Match validation thresholds
  minimum_match_confidence: number;
  excellent_match_threshold: number;
}

const DEFAULT_MATCH_CRITERIA: MatchCriteria = {
  // Name similarity: 0.0 = completely different, 1.0 = identical
  minimum_name_similarity: 0.4, // Increased from 0.3 to 0.4
  strong_name_similarity: 0.8, // Increased from 0.7 to 0.8

  // Address similarity: focus heavily on exact address matches
  minimum_address_similarity: 0.75, // Increased from 0.5 to 0.75 - much stricter
  strong_address_similarity: 0.95, // Increased from 0.9 to 0.95

  // Geographic proximity limits - MUCH stricter
  maximum_distance_meters: 150, // Reduced from 500m to 150m
  same_location_distance_meters: 30, // Reduced from 50m to 30m

  // Price correlation (when enabled)
  maximum_price_difference_ratio: 0.4, // Reduced from 0.5 to 0.4 (40% max)
  consider_price_in_matching: true,

  // Confidence scoring components
  base_confidence_score: 0.3, // Reduced from 0.4 to 0.3
  provider_count_bonus: 0.2, // Increased from 0.15 to 0.2
  coordinate_data_bonus: 0.1,
  complete_address_bonus: 0.05,
  same_address_bonus: 0.25, // Increased from 0.2 to 0.25

  // Quality thresholds
  minimum_match_confidence: 0.7, // Increased from 0.6 to 0.7
  excellent_match_threshold: 0.9,
};

/**
 * Location Matching Service
 *
 * Implements sophisticated algorithms to match parking locations across providers.
 * Uses multiple signals: name similarity, address matching, coordinate proximity, and price correlation.
 */
export class LocationMatchingService {
  private criteria: MatchCriteria;

  constructor(criteria: MatchCriteria = DEFAULT_MATCH_CRITERIA) {
    this.criteria = criteria;
  }

  /**
   * Find matches across all providers for locations
   */
  findMatches(locations: ParkingLocation[]): MatchedLocation[] {
    const matches: MatchedLocation[] = [];
    const processed = new Set<string>();

    for (const location of locations) {
      const locationKey = `${location.provider}:${location.provider_id}`;

      if (processed.has(locationKey)) {
        continue;
      }

      // Find all potential matches for this location
      const candidateMatches = this.findCandidateMatches(
        location,
        locations,
        processed
      );

      if (candidateMatches.length > 0) {
        const match = this.createMatchedLocation([
          location,
          ...candidateMatches,
        ]);
        matches.push(match);

        // Mark all matched locations as processed
        [location, ...candidateMatches].forEach((loc) => {
          processed.add(`${loc.provider}:${loc.provider_id}`);
        });
      }
    }

    return matches.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  private findCandidateMatches(
    targetLocation: ParkingLocation,
    allLocations: ParkingLocation[],
    processed: Set<string>
  ): ParkingLocation[] {
    const candidates: Array<{
      location: ParkingLocation;
      score: number;
      reasons: string[];
    }> = [];

    for (const location of allLocations) {
      const locationKey = `${location.provider}:${location.provider_id}`;

      // Skip same provider, same location, or already processed locations
      if (
        location.provider === targetLocation.provider ||
        location.provider_id === targetLocation.provider_id ||
        processed.has(locationKey)
      ) {
        continue;
      }

      const matchResult = this.calculateMatchScore(targetLocation, location);

      if (matchResult.score >= 0.5) {
        // Minimum threshold for consideration
        candidates.push({
          location,
          score: matchResult.score,
          reasons: matchResult.reasons,
        });
      }
    }

    // Return only the best matches (score >= 0.65)
    return candidates
      .filter((c) => c.score >= this.criteria.minimum_match_confidence)
      .map((c) => c.location);
  }

  private calculateMatchScore(
    loc1: ParkingLocation,
    loc2: ParkingLocation
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let totalScore = 0;

    // Check for obvious different location indicators first
    if (this.areObviouslyDifferentLocations(loc1, loc2)) {
      return {
        score: 0,
        reasons: ["Locations are obviously different facilities"],
      };
    }

    // 1. ADDRESS SIMILARITY IS PRIMARY SIGNAL (weight: 0.6)
    const addressSimilarity = this.calculateAddressSimilarity(
      loc1.address,
      loc2.address
    );

    // STRICT ADDRESS VALIDATION: If addresses are different, require very close proximity
    if (addressSimilarity < this.criteria.strong_address_similarity) {
      if (loc1.coordinates && loc2.coordinates) {
        const distanceMeters = this.calculateDistance(
          loc1.coordinates,
          loc2.coordinates
        );
        // If addresses don't match well AND locations aren't very close, reject
        if (distanceMeters > this.criteria.same_location_distance_meters) {
          return {
            score: 0,
            reasons: [
              `Different addresses (${(addressSimilarity * 100).toFixed(
                1
              )}% similarity) and too far apart (${distanceMeters.toFixed(
                0
              )}m > ${this.criteria.same_location_distance_meters}m threshold)`,
            ],
          };
        }
      } else {
        // No coordinates to verify proximity, so require good address match
        if (addressSimilarity < this.criteria.minimum_address_similarity) {
          return {
            score: 0,
            reasons: [
              `Insufficient address similarity (${(
                addressSimilarity * 100
              ).toFixed(1)}%) and no coordinates to verify proximity`,
            ],
          };
        }
      }
    }

    if (addressSimilarity >= this.criteria.minimum_address_similarity) {
      const addressScore = addressSimilarity * 0.6; // High weight for address
      totalScore += addressScore;
      reasons.push(
        `Address similarity: ${(addressSimilarity * 100).toFixed(1)}% ("${
          loc1.address.full_address
        }" vs "${loc2.address.full_address}")`
      );

      // MAJOR bonus for exact/near-exact address matches
      if (addressSimilarity >= this.criteria.strong_address_similarity) {
        totalScore += this.criteria.same_address_bonus;
        reasons.push(
          `Strong address match bonus: +${(
            this.criteria.same_address_bonus * 100
          ).toFixed(0)}%`
        );
      }
    }

    // 2. Name similarity (weight: 0.25)
    const nameSimilarity = this.calculateStringSimilarity(
      this.normalizeName(loc1.name),
      this.normalizeName(loc2.name)
    );
    if (nameSimilarity >= this.criteria.minimum_name_similarity) {
      totalScore += nameSimilarity * 0.25;
      reasons.push(
        `Name similarity: ${(nameSimilarity * 100).toFixed(1)}% ("${
          loc1.name
        }" vs "${loc2.name}")`
      );
    }

    // 3. Coordinate proximity (weight: 0.15)
    if (loc1.coordinates && loc2.coordinates) {
      const distanceMeters = this.calculateDistance(
        loc1.coordinates,
        loc2.coordinates
      );
      if (distanceMeters <= this.criteria.maximum_distance_meters) {
        const proximityScore = Math.max(
          0,
          1 - distanceMeters / this.criteria.maximum_distance_meters
        );
        totalScore += proximityScore * 0.15;
        reasons.push(
          `Geographic proximity: ${distanceMeters.toFixed(0)}m apart`
        );

        // Bonus for same location
        if (distanceMeters <= this.criteria.same_location_distance_meters) {
          totalScore += 0.1;
          reasons.push(
            `Same location bonus: very close (${distanceMeters.toFixed(0)}m)`
          );
        }
      }
    }

    // 4. Price correlation (optional validation)
    if (this.criteria.consider_price_in_matching) {
      const priceDifference =
        Math.abs(loc1.pricing.daily_rate - loc2.pricing.daily_rate) /
        Math.max(loc1.pricing.daily_rate, loc2.pricing.daily_rate);
      if (priceDifference <= this.criteria.maximum_price_difference_ratio) {
        const priceScore = (1 - priceDifference) * 0.1;
        totalScore += priceScore;
        reasons.push(
          `Price similarity: ${(priceDifference * 100).toFixed(
            1
          )}% difference ($${loc1.pricing.daily_rate} vs $${
            loc2.pricing.daily_rate
          })`
        );
      } else {
        // Price matching enabled but failed - reject match
        return {
          score: 0,
          reasons: [
            `Price difference too large: ${(priceDifference * 100).toFixed(
              1
            )}% (max: ${(
              this.criteria.maximum_price_difference_ratio * 100
            ).toFixed(0)}%)`,
          ],
        };
      }
    }

    // Require minimum confidence threshold
    if (totalScore < this.criteria.minimum_match_confidence) {
      return {
        score: 0,
        reasons: [
          `Total confidence too low: ${(totalScore * 100).toFixed(
            1
          )}% (minimum: ${(
            this.criteria.minimum_match_confidence * 100
          ).toFixed(0)}%)`,
        ],
      };
    }

    return {
      score: Math.min(1.0, totalScore), // Cap at 100%
      reasons,
    };
  }

  private areObviouslyDifferentLocations(
    loc1: ParkingLocation,
    loc2: ParkingLocation
  ): boolean {
    const name1 = loc1.name.toLowerCase();
    const name2 = loc2.name.toLowerCase();

    // Check for different lot/terminal designations (A vs B, 1 vs 2, etc.)
    const lotPatterns = [
      /\blot\s+([a-z]|\d+)\b/i,
      /\bterminal\s+([a-z]|\d+)\b/i,
      /\bbuilding\s+([a-z]|\d+)\b/i,
      /\bgarage\s+([a-z]|\d+)\b/i,
      /\bstructure\s+([a-z]|\d+)\b/i,
    ];

    for (const pattern of lotPatterns) {
      const match1 = name1.match(pattern);
      const match2 = name2.match(pattern);

      if (match1 && match2 && match1[1] !== match2[1]) {
        return true; // Different lot/terminal/building designations
      }
    }

    // Check for completely different brand names (hotel chains, etc.)
    const brandPatterns = [
      /\b(marriott|hilton|hyatt|sheraton|westin|doubletree|embassy|holiday\s+inn|best\s+western|courtyard|fairfield|residence\s+inn)\b/i,
    ];

    for (const pattern of brandPatterns) {
      const brand1 = name1.match(pattern)?.[1];
      const brand2 = name2.match(pattern)?.[1];

      if (brand1 && brand2 && brand1 !== brand2) {
        return true; // Different hotel brands
      }
    }

    return false;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Implements Levenshtein distance for string similarity
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0
      ? 1
      : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  private calculateAddressSimilarity(addr1: any, addr2: any): number {
    // Compare street addresses with normalization
    const street1 = this.normalizeAddress(addr1.street);
    const street2 = this.normalizeAddress(addr2.street);

    const streetSimilarity = this.calculateStringSimilarity(street1, street2);

    // Exact match on city/state gives bonus
    const cityMatch =
      addr1.city.toLowerCase() === addr2.city.toLowerCase() ? 1 : 0;
    const stateMatch =
      addr1.state.toLowerCase() === addr2.state.toLowerCase() ? 1 : 0;

    // Weight: street 60%, city 30%, state 10%
    return streetSimilarity * 0.6 + cityMatch * 0.3 + stateMatch * 0.1;
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/'/g, "") // Remove apostrophes
      .replace(/\b(the|hotel|garage|lot|parking|self|park)\b/g, "") // Remove common words
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
  }

  private normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .replace(
        /\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|north|n|south|s|east|e|west|w)\b\.?/g,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    // Haversine formula for calculating distance between two points
    const R = 6371000; // Earth's radius in meters
    const dLat = this.degreesToRadians(coord2.latitude - coord1.latitude);
    const dLon = this.degreesToRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(coord1.latitude)) *
        Math.cos(this.degreesToRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in meters
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private createMatchedLocation(locations: ParkingLocation[]): MatchedLocation {
    // Use the location with the most complete data as canonical
    const canonicalLocation = locations.reduce((best, current) => {
      const currentScore = this.calculateCompletenessScore(current);
      const bestScore = this.calculateCompletenessScore(best);
      return currentScore > bestScore ? current : best;
    });

    // Calculate average coordinates if available
    const locationsWithCoords = locations.filter((loc) => loc.coordinates);
    const avgCoordinates =
      locationsWithCoords.length > 0
        ? {
            latitude:
              locationsWithCoords.reduce(
                (sum, loc) => sum + loc.coordinates!.latitude,
                0
              ) / locationsWithCoords.length,
            longitude:
              locationsWithCoords.reduce(
                (sum, loc) => sum + loc.coordinates!.longitude,
                0
              ) / locationsWithCoords.length,
          }
        : undefined;

    // Calculate confidence using named criteria
    const baseScore = this.criteria.base_confidence_score;
    const providerBonus =
      (locations.length - 1) * this.criteria.provider_count_bonus;
    const coordinateBonus = avgCoordinates
      ? this.criteria.coordinate_data_bonus
      : 0;
    const addressBonus = locations.every((loc) => loc.address.zip)
      ? this.criteria.complete_address_bonus
      : 0;

    const confidence = Math.min(
      0.95,
      baseScore + providerBonus + coordinateBonus + addressBonus
    );

    const matchReasons = [
      `Matched across ${locations.length} providers`,
      ...locations.map((loc) => `${loc.provider}: ${loc.name}`),
    ];

    return {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      canonical_name: canonicalLocation.name,
      canonical_address: canonicalLocation.address,
      coordinates: avgCoordinates,
      airport_code: canonicalLocation.airport_code,
      locations,
      confidence_score: confidence,
      match_reasons: matchReasons,
    };
  }

  private calculateCompletenessScore(location: ParkingLocation): number {
    let score = 0;

    if (location.coordinates) score += 0.3;
    if (location.address.zip) score += 0.2;
    if (location.distance_to_airport_miles) score += 0.2;
    if (location.amenities.length > 0) score += 0.2;
    if (location.pricing.hourly_rate) score += 0.1;

    return score;
  }

  /**
   * Generate a detailed matching report
   */
  generateMatchingReport(matches: MatchedLocation[]): string {
    const allLocations = matches.flatMap((match) => match.locations);
    const providerCounts = allLocations.reduce((acc, loc) => {
      acc[loc.provider] = (acc[loc.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = [
      "# Parking Location Matching Report",
      `Generated: ${new Date().toISOString()}`,
      `Price Matching: ${
        this.criteria.consider_price_in_matching ? "Enabled" : "Disabled"
      }`,
      "",
      `## Algorithm Overview`,
      `This matching system identifies the same parking facilities across different providers using:`,
      `- **Name Similarity**: Fuzzy matching with >${this.criteria.minimum_name_similarity} minimum threshold, >${this.criteria.strong_name_similarity} for strong evidence`,
      `- **Address Analysis**: PRIMARY SIGNAL - >${this.criteria.minimum_address_similarity} minimum, >${this.criteria.strong_address_similarity} for strong match`,
      `- **Geographic Proximity**: Locations within ${this.criteria.maximum_distance_meters}m considered nearby, under ${this.criteria.same_location_distance_meters}m = same location`,
      `- **Price Correlation**: ${
        this.criteria.consider_price_in_matching
          ? `Prices must be within ${(
              this.criteria.maximum_price_difference_ratio * 100
            ).toFixed(0)}% of each other`
          : "Price differences ignored"
      }`,
      `- **Smart Differentiation**: Prevents matching obviously different facilities`,
      "",
      `## Summary`,
      `- Total matched location groups: ${matches.length}`,
      `- Total locations processed: ${allLocations.length}`,
      `- Provider distribution: ${Object.entries(providerCounts)
        .map(([provider, count]) => `${provider}: ${count}`)
        .join(", ")}`,
      `- Average confidence score: ${(
        (matches.reduce((sum, m) => sum + m.confidence_score, 0) /
          matches.length) *
        100
      ).toFixed(1)}%`,
      `- High confidence matches (>80%): ${
        matches.filter((m) => m.confidence_score > 0.8).length
      }`,
      "",
      "## Detailed Matches",
      "",
    ];

    matches.forEach((match, index) => {
      report.push(`### Match ${index + 1}: ${match.canonical_name}`);
      report.push(
        `**Confidence:** ${(match.confidence_score * 100).toFixed(1)}%`
      );
      report.push(
        `**Quality:** ${this.getMatchQualityLabel(match.confidence_score)}`
      );
      report.push(`**Address:** ${match.canonical_address.full_address}`);
      if (match.coordinates) {
        report.push(
          `**Coordinates:** ${match.coordinates.latitude.toFixed(
            6
          )}, ${match.coordinates.longitude.toFixed(6)}`
        );
      }

      // Add geographic analysis
      const distances = this.calculateDistancesInMatch(match.locations);
      if (distances.length > 0) {
        const maxDistance = Math.max(...distances);
        const avgDistance =
          distances.reduce((sum, d) => sum + d, 0) / distances.length;
        report.push(
          `**Geographic Spread:** Max ${maxDistance.toFixed(
            0
          )}m, Avg ${avgDistance.toFixed(0)}m between locations`
        );
      }

      report.push("");

      report.push("**Providers:**");
      match.locations.forEach((loc) => {
        report.push(
          `- **${loc.provider}**: ${loc.name} - $${loc.pricing.daily_rate}/day`
        );
        report.push(`  - Address: ${loc.address.full_address}`);
        if (loc.coordinates) {
          report.push(
            `  - Coordinates: ${loc.coordinates.latitude}, ${loc.coordinates.longitude}`
          );
        }
        if (loc.amenities && loc.amenities.length > 0) {
          report.push(`  - Amenities: ${loc.amenities.join(", ")}`);
        }
      });

      report.push("");
      report.push("**Match Reasons:**");
      match.match_reasons.forEach((reason) => {
        report.push(`- ${reason}`);
      });

      report.push("");
      report.push("---");
      report.push("");
    });

    return report.join("\n");
  }

  private calculateDistancesInMatch(locations: ParkingLocation[]): number[] {
    const distances: number[] = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        if (locations[i].coordinates && locations[j].coordinates) {
          const distance = this.calculateDistance(
            locations[i].coordinates!,
            locations[j].coordinates!
          );
          distances.push(distance);
        }
      }
    }
    return distances;
  }

  private getMatchQualityLabel(confidence: number): string {
    if (confidence >= 0.9) return "Excellent";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.7) return "Good";
    if (confidence >= 0.6) return "Fair";
    return "Low";
  }
}

export const locationMatchingService = new LocationMatchingService();
