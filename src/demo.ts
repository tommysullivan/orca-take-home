#!/usr/bin/env tsx

import * as fs from "fs";
import * as path from "path";
import { dbTypesafe } from "./db/dbTypesafe";
import { cheapAirportParkingMockService } from "./providers/cheapAirportParking/CheapAirportParkingMockService";
import { ApiSearchParams } from "./providers/common/ApiSearchParams";
import { ParkingProvider } from "./providers/common/ParkingProvider";
import { parkWhizService } from "./providers/parkwhiz/ParkWhizService";
import { spotHeroMockService } from "./providers/spotHero/mock/SpotHeroMockService";
import { ParkingAggregationService } from "./services/aggregation/ParkingAggregationService";
import { locationMatchingService } from "./services/locationMatching/LocationMatchingService";

/**
 * Parking Location Quote Matching - Main Demo
 *
 * This script demonstrates the complete solution for the take-home challenge:
 * 1. Queries multiple parking providers (ParkWhiz, SpotHero, Cheap Airport Parking)
 * 2. Normalizes and stores the data
 * 3. Finds matches across providers
 * 4. Generates reports and exports
 */

async function main() {
  console.log("🅿️  PARKING LOCATION QUOTE MATCHING SYSTEM (REAL PARKWHIZ)");
  console.log("========================================================");
  console.log("");

  try {
    // Initialize the service with real ParkWhiz + mock others (like real integration tests)
    console.log("🔧 Initializing services with REAL ParkWhiz...");

    const providers = {
      [ParkingProvider.PARKWHIZ]: parkWhizService,
      [ParkingProvider.SPOTHERO]: spotHeroMockService, // Mock for now
      [ParkingProvider.CHEAP_AIRPORT_PARKING]: cheapAirportParkingMockService, // Mock for now
    };

    const service = new ParkingAggregationService(
      dbTypesafe,
      providers,
      locationMatchingService
    );

    console.log("✅ Service initialized with real ParkWhiz provider!");

    // Test airports and date ranges - using dates that match real ParkWhiz purchase_options availability
    // Real API returns purchase_options with start_time/end_time around current date (Oct 16-17, 2025)
    const testCases: ApiSearchParams[] = [
      {
        airport_code: "ORD",
        start_time: "2025-10-17T10:00:00",
        end_time: "2025-10-18T10:00:00",
      },
      {
        airport_code: "LAX",
        start_time: "2025-10-17T08:00:00",
        end_time: "2025-10-18T08:00:00",
      },
    ];

    // Process each test case
    for (const testCase of testCases) {
      console.log(`\n🛫 PROCESSING: ${testCase.airport_code} Airport`);
      console.log("=".repeat(50));

      const results = await service.searchParkingWithMatching(testCase);

      // Generate reports
      const reports = await service.generateReports(results.matches);

      // Save reports to files
      const outputDir = "./outputs";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePrefix = `${testCase.airport_code}_${timestamp}`;

      // Save matching report
      const reportPath = path.join(
        outputDir,
        `${filePrefix}_matching_report.md`
      );
      fs.writeFileSync(reportPath, reports.matching_report);
      console.log(`📄 Matching report saved: ${reportPath}`);

      // Save CSV export
      const csvPath = path.join(outputDir, `${filePrefix}_matches.csv`);
      fs.writeFileSync(csvPath, reports.csv_export);
      console.log(`📊 CSV export saved: ${csvPath}`);

      // Save JSON data
      const jsonPath = path.join(outputDir, `${filePrefix}_full_data.json`);
      fs.writeFileSync(
        jsonPath,
        JSON.stringify(
          {
            search_params: testCase,
            results,
            generated_at: new Date().toISOString(),
          },
          null,
          2
        )
      );
      console.log(`📋 Full data saved: ${jsonPath}`);
    }

    console.log("\n✅ DEMO COMPLETED SUCCESSFULLY!");
    console.log("\nOutput files generated:");
    console.log("- Matching reports (Markdown)");
    console.log("- CSV exports for analysis");
    console.log("- Complete JSON datasets");
    console.log("\nNext steps:");
    console.log("1. Review the generated reports in ./outputs/");
    console.log("2. Analyze CSV data in spreadsheet software");
    console.log("3. Check database for persistent storage");
  } catch (error) {
    console.error("❌ Error running demo:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

// Run the demo
main().catch(console.error);
