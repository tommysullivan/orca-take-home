import { MatchCriteria } from "./MatchCriteria";

export const DEFAULT_MATCH_CRITERIA: MatchCriteria = {
  // Name similarity: 0.0 = completely different, 1.0 = identical
  minimum_name_similarity: 0.4,
  strong_name_similarity: 0.8,

  // Address similarity: focus heavily on exact address matches
  minimum_address_similarity: 0.75,
  strong_address_similarity: 0.95,

  // Geographic proximity limits
  maximum_distance_meters: 150,
  same_location_distance_meters: 30,

  // Price correlation (when enabled)
  maximum_price_difference_ratio: 0.4,
  consider_price_in_matching: true,

  // Confidence scoring components
  base_confidence_score: 0.3,
  provider_count_bonus: 0.2,
  coordinate_data_bonus: 0.1,
  complete_address_bonus: 0.05,
  same_address_bonus: 0.25,

  // Quality thresholds
  minimum_match_confidence: 0.7,
  excellent_match_threshold: 0.9,
};
