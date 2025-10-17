import { dbTypesafe } from "../db/dbTypesafe";
import { cheapAirportParkingMockProvider } from "../providers/cheapAirportParking/mock/CheapAirportParkingMockProvider";
import { mockParkWhizProvider } from "../providers/parkwhiz/mock/MockParkWhizProvider";
import { ParkingProviderType } from "../providers/common/ParkingProviderType";
import { spotHeroMockProvider } from "../providers/spotHero/mock/SpotHeroMockProvider";
import { ParkingAggregationService } from "./ParkingAggregationService";
import { locationMatchingService } from "../locationMatching/LocationMatchingService";

export async function createParkingAggregationService(): Promise<ParkingAggregationService> {
  const providers = {
    [ParkingProviderType.PARKWHIZ]: mockParkWhizProvider,
    [ParkingProviderType.SPOTHERO]: spotHeroMockProvider,
    [ParkingProviderType.CHEAP_AIRPORT_PARKING]:
      cheapAirportParkingMockProvider,
  };

  return new ParkingAggregationService(
    dbTypesafe,
    providers,
    locationMatchingService
  );
}
