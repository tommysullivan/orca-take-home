export interface MatchCriteria {
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
