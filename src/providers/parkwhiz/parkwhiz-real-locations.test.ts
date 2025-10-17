import { describe, test, expect } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { parkWhizRealLocationService, ParkWhizRealLocation } from './parkwhiz-real-locations';

describe('ParkWhiz Real API End-to-End', () => {
  test('should execute full authentication and location retrieval workflow for ORD', async () => {
    console.log('🚀 Starting end-to-end ParkWhiz API test for ORD...');
    
    // Execute the full workflow: get token -> autocomplete -> scrape HTML -> extract locations
    const locations = await parkWhizRealLocationService.getLocationsForAirport('ORD');
    
    // Validate we got real results
    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    
    console.log(`✅ Retrieved ${locations.length} locations for ORD`);
    
    // Validate location data structure
    const firstLocation = locations[0];
    expect(firstLocation.location_id).toBeDefined();
    expect(firstLocation.type).toBeDefined();
    expect(firstLocation._embedded).toBeDefined();
    expect(firstLocation._embedded['pw:location']).toBeDefined();
    expect(firstLocation._embedded['pw:location'].name).toBeDefined();
    
    // Debug the actual structure to understand coordinates location
    console.log('🔍 First location structure keys:', Object.keys(firstLocation._embedded['pw:location']));
    
    // Check for coordinates (they're in the entrances array in real API responses)
    const locationData = firstLocation._embedded['pw:location'] as any;
    expect(locationData.entrances).toBeDefined();
    expect(locationData.entrances[0]).toBeDefined();
    expect(locationData.entrances[0].coordinates).toBeDefined();
    
    // Log sample data for verification
    console.log('📍 Sample location data:');
    console.log(`   ID: ${firstLocation.location_id}`);
    console.log(`   Name: ${firstLocation._embedded['pw:location'].name}`);
    console.log(`   Address: ${firstLocation._embedded['pw:location'].address1}`);
    console.log(`   Coordinates: [${(firstLocation._embedded['pw:location'] as any).entrances[0].coordinates.join(', ')}]`);
    
    if (firstLocation.purchase_options && firstLocation.purchase_options.length > 0) {
      console.log(`   Price: $${firstLocation.purchase_options[0].price.USD}`);
    }
    
    console.log(`   Distance: ${firstLocation.distance.straight_line.feet} feet from airport`);
    
    // Output to JSON file for inspection
    const outputPath = join(process.cwd(), 'outputs', `ORD_parkwhiz_locations_${new Date().toISOString().split('T')[0]}.json`);
    writeFileSync(outputPath, JSON.stringify(locations, null, 2));
    console.log(`📄 Saved ORD locations to: ${outputPath}`);
  }, 60000); // 60 second timeout for full workflow

  test('should execute full workflow for LAX airport', async () => {
    console.log('🚀 Starting end-to-end ParkWhiz API test for LAX...');
    
    const locations = await parkWhizRealLocationService.getLocationsForAirport('LAX');
    
    expect(locations).toBeDefined();
    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    
    console.log(`✅ Retrieved ${locations.length} locations for LAX`);
    
    // Verify data quality
    locations.forEach((location, index) => {
      if (index < 3) { // Log first 3 locations
        console.log(`📍 Location ${index + 1}: ${location._embedded['pw:location'].name}`);
      }
    });
    
    // Output to JSON file for inspection
    const outputPath = join(process.cwd(), 'outputs', `LAX_parkwhiz_locations_${new Date().toISOString().split('T')[0]}.json`);
    writeFileSync(outputPath, JSON.stringify(locations, null, 2));
    console.log(`📄 Saved LAX locations to: ${outputPath}`);
  }, 60000);

  test('should handle invalid airport codes gracefully', async () => {
    console.log('🧪 Testing invalid airport code handling...');
    
    await expect(
      parkWhizRealLocationService.getLocationsForAirport('INVALID')
    ).rejects.toThrow(); // Just expect any error for invalid codes
    
    console.log('✅ Invalid airport code handled correctly');
  }, 30000);
});