import { dbTypesafe } from "../../db/dbTypesafe";
import { cheapAirportParkingMockService } from "../../providers/cheapAirportParking/CheapAirportParkingMockService";
import { mockParkWhizService } from "../../providers/parkwhiz/mock/MockParkWhizService";
import { ParkingProvider } from "../../providers/common/ParkingProvider";
import { spotHeroMockService } from "../../providers/spotHero/mock/SpotHeroMockService";
import { locationMatchingService } from "../locationMatching/locationMatchingService.1";
import { ParkingAggregationService } from "./ParkingAggregationService";

export async function createParkingAggregationService(): Promise<ParkingAggregationService> {
  const providers = {
    [ParkingProvider.PARKWHIZ]: mockParkWhizService,
    [ParkingProvider.SPOTHERO]: spotHeroMockService,
    [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingMockService,
  };

  return new ParkingAggregationService(
    dbTypesafe,
    providers,
    locationMatchingService
  );
}
