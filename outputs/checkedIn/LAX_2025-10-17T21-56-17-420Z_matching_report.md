# Parking Location Matching Report
Generated: 2025-10-17T21:56:17.420Z
Price Matching: Enabled

## Algorithm Overview
This matching system identifies the same parking facilities across different providers using:
- **Name Similarity**: Fuzzy matching with >0.4 minimum threshold, >0.8 for strong evidence
- **Address Analysis**: PRIMARY SIGNAL - >0.75 minimum, >0.95 for strong match
- **Geographic Proximity**: Locations within 150m considered nearby, under 30m = same location
- **Price Correlation**: Prices must be within 40% of each other
- **Smart Differentiation**: Prevents matching obviously different facilities

## Summary
- Total matched location groups: 8
- Total locations processed: 24
- Provider distribution: parkwhiz: 7, spothero: 11, cheap_airport_parking: 6
- Average confidence score: 78.8%
- High confidence matches (>80%): 4

## Detailed Matches

### Match 1: Joe's Airport Parking LAX
**Confidence:** 95.0%
**Quality:** Excellent
**Address:** 6151 W. Century Blvd., Los Angeles, CA 90045
**Coordinates:** 33.945797, -118.392207
**Geographic Spread:** Max 87m, Avg 49m between locations

**Providers:**
- **parkwhiz**: Joe's Airport Parking LAX - $18.58/day
  - Address: 6151 W. Century Blvd., Los Angeles, CA 90045
  - Coordinates: 33.94567694669231, -118.39248892691104
  - Amenities: attended, unobstructed, vehicle_charging, shuttle, indoor
- **spothero**: Joe's Airport Parking - LAX - Uncovered Rooftop Self Park - $17.95/day
  - Address: 6151 West Century Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.945598, -118.39188500000002
  - Amenities: self_park, covered, touchless, attendant, wheelchair_accessible
- **spothero**: Joe's Airport Parking - Covered Self Park Garage - $19.95/day
  - Address: 6151 West Century Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.9459772, -118.39271349999999
  - Amenities: self_park, covered, touchless, attendant, shuttle
- **cheap_airport_parking**: Joe's Airport Parking - $23.74/day
  - Address: 6151 W Century Blvd, Los Angeles, CA, 90045
  - Coordinates: 33.945867, -118.391975
  - Amenities: shuttle, self-park
- **cheap_airport_parking**: Joe's Airport Parking - $25.94/day
  - Address: 6151 W Century Blvd, Los Angeles, CA, 90045
  - Coordinates: 33.945867, -118.391975
  - Amenities: shuttle, self-park

**Match Reasons:**
- Matched across 5 providers
- parkwhiz: Joe's Airport Parking LAX
- spothero: Joe's Airport Parking - LAX - Uncovered Rooftop Self Park
- spothero: Joe's Airport Parking - Covered Self Park Garage
- cheap_airport_parking: Joe's Airport Parking
- cheap_airport_parking: Joe's Airport Parking

---

### Match 2: Airport Center Parking LAX
**Confidence:** 95.0%
**Quality:** Excellent
**Address:** 5960 W. 98th St., Los Angeles, CA 90045
**Coordinates:** 33.947009, -118.388998
**Geographic Spread:** Max 152m, Avg 103m between locations

**Providers:**
- **parkwhiz**: Airport Center Parking LAX - $18.58/day
  - Address: 5960 W. 98th St., Los Angeles, CA 90045
  - Coordinates: 33.946559628660076, -118.38861119002107
  - Amenities: attended, unobstructed, shuttle, indoor
- **spothero**: Airport Center Parking - Covered Self Park - $23.3/day
  - Address: 5960 West 98th Street, Los Angeles, CA 90045
  - Coordinates: 33.946955, -118.388059
  - Amenities: self_park, covered, touchless, attendant, shuttle
- **cheap_airport_parking**: Airport Center Parking - $25.94/day
  - Address: 5960 W 98th St, Los Angeles, CA, 90045
  - Coordinates: 33.94726, -118.38966
  - Amenities: shuttle, self-park
- **cheap_airport_parking**: Airport Center Parking - $23.74/day
  - Address: 5960 W 98th St, Los Angeles, CA, 90045
  - Coordinates: 33.94726, -118.38966
  - Amenities: shuttle, self-park

**Match Reasons:**
- Matched across 4 providers
- parkwhiz: Airport Center Parking LAX
- spothero: Airport Center Parking - Covered Self Park
- cheap_airport_parking: Airport Center Parking
- cheap_airport_parking: Airport Center Parking

---

### Match 3: WallyPark LAX Premier Garage
**Confidence:** 95.0%
**Quality:** Excellent
**Address:** 9700 Bellanca Ave., Los Angeles, CA 90045
**Coordinates:** 33.948192, -118.379516
**Geographic Spread:** Max 63m, Avg 40m between locations

**Providers:**
- **parkwhiz**: WallyPark LAX Premier Garage - $24.58/day
  - Address: 9700 Bellanca Ave., Los Angeles, CA 90045
  - Coordinates: 33.94794738107742, -118.37981387972832
  - Amenities: attended, unobstructed, vehicle_charging, shuttle, indoor, valet
- **spothero**: WallyPark LAX Premier - Covered Valet - $40.04/day
  - Address: 9700 Bellanca Avenue, Los Angeles, CA 90045
  - Coordinates: 33.948298699999995, -118.37927800000001
  - Amenities: valet, covered, attendant, shuttle, wheelchair_accessible
- **spothero**: WallyPark LAX Premier - Covered Self Park - $26.46/day
  - Address: 9700 Bellanca Avenue, Los Angeles, CA 90045
  - Coordinates: 33.948298699999995, -118.37927800000001
  - Amenities: self_park, covered, touchless, shuttle, wheelchair_accessible
- **cheap_airport_parking**: WallyPark Premier Garage - $29.24/day
  - Address: 9700 Bellanca Ave, Los Angeles, CA, 90045
  - Coordinates: 33.948224, -118.379694
  - Amenities: shuttle, self-park

**Match Reasons:**
- Matched across 4 providers
- parkwhiz: WallyPark LAX Premier Garage
- spothero: WallyPark LAX Premier - Covered Valet
- spothero: WallyPark LAX Premier - Covered Self Park
- cheap_airport_parking: WallyPark Premier Garage

---

### Match 4: LAX Operating- 9750 Airport Blvd (Formerly Four Points by Sheraton)
**Confidence:** 85.0%
**Quality:** High
**Address:** 9750 Airport Blvd., Los Angeles, CA 90045
**Coordinates:** 33.947623, -118.385191
**Geographic Spread:** Max 97m, Avg 65m between locations

**Providers:**
- **parkwhiz**: LAX Operating- 9750 Airport Blvd (Formerly Four Points by Sheraton) - $10.54/day
  - Address: 9750 Airport Blvd., Los Angeles, CA 90045
  - Coordinates: 33.947679266565984, -118.38588961945791
  - Amenities: attended, security, unobstructed, handicap
- **spothero**: 9750 Airport Blvd - Covered Self Park - $11.49/day
  - Address: 9750 Airport Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.947595, -118.384841
  - Amenities: self_park, covered, touchless, attendant, wheelchair_accessible, ev
- **spothero**: 9750 Airport Blvd. - Uncovered Self Park - $10.49/day
  - Address: 9750 Airport Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.947595, -118.384841
  - Amenities: self_park, paved, touchless

**Match Reasons:**
- Matched across 3 providers
- parkwhiz: LAX Operating- 9750 Airport Blvd (Formerly Four Points by Sheraton)
- spothero: 9750 Airport Blvd - Covered Self Park
- spothero: 9750 Airport Blvd. - Uncovered Self Park

---

### Match 5: Sheraton Gateway Parking LAX - Valet
**Confidence:** 65.0%
**Quality:** Fair
**Address:** 6101 W. Century Blvd., Los Angeles, CA 90045
**Coordinates:** 33.945897, -118.390141
**Geographic Spread:** Max 21m, Avg 21m between locations

**Providers:**
- **parkwhiz**: Sheraton Gateway Parking LAX - Valet - $21.2/day
  - Address: 6101 W. Century Blvd., Los Angeles, CA 90045
  - Coordinates: 33.94597315212469, -118.39020609855653
  - Amenities: attended, valet
- **spothero**: Sheraton Gateway Hotel LAX - Uncovered Valet - $17.99/day
  - Address: 6101 West Century Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.9458213, -118.3900764
  - Amenities: valet, paved, attendant, shuttle

**Match Reasons:**
- Matched across 2 providers
- parkwhiz: Sheraton Gateway Parking LAX - Valet
- spothero: Sheraton Gateway Hotel LAX - Uncovered Valet

---

### Match 6: 909 N. Pacific Coast Hwy. Garage LAX
**Confidence:** 65.0%
**Quality:** Fair
**Address:** 909 N. Pacific Coast Hwy., El Segundo, CA 90245
**Coordinates:** 33.929973, -118.396508
**Geographic Spread:** Max 48m, Avg 48m between locations

**Providers:**
- **parkwhiz**: 909 N. Pacific Coast Hwy. Garage LAX - $8.67/day
  - Address: 909 N. Pacific Coast Hwy., El Segundo, CA 90245
  - Coordinates: 33.93016513314915, -118.39638590812685
  - Amenities: indoor, unobstructed, vehicle_charging
- **spothero**: 909 PCH Garage - Covered Self Park - $7.48/day
  - Address: 909 N Pacific Coast Hwy S, El Segundo, CA 90245
  - Coordinates: 33.929781, -118.396631
  - Amenities: self_park, covered, attendant, wheelchair_accessible

**Match Reasons:**
- Matched across 2 providers
- parkwhiz: 909 N. Pacific Coast Hwy. Garage LAX
- spothero: 909 PCH Garage - Covered Self Park

---

### Match 7: Sam’s Parking LAX - Valet
**Confidence:** 65.0%
**Quality:** Fair
**Address:** 8923 S. Sepulveda Blvd., Los Angeles, CA 90045
**Coordinates:** 33.955207, -118.396495
**Geographic Spread:** Max 42m, Avg 42m between locations

**Providers:**
- **parkwhiz**: Sam’s Parking LAX - Valet - $35.95/day
  - Address: 8923 S. Sepulveda Blvd., Los Angeles, CA 90045
  - Coordinates: 33.95502, -118.39645
  - Amenities: attended, security, valet, restrooms, vehicle_charging, indoor
- **spothero**: Airport Valet Curbside - Uncovered Curbside Valet - $43.95/day
  - Address: 8923 South Sepulveda Boulevard, Los Angeles, CA 90045
  - Coordinates: 33.9553942, -118.3965397
  - Amenities: valet, paved, attendant, wheelchair_accessible

**Match Reasons:**
- Matched across 2 providers
- parkwhiz: Sam’s Parking LAX - Valet
- spothero: Airport Valet Curbside - Uncovered Curbside Valet

---

### Match 8: 405 Airport Parking - Covered Self Park
**Confidence:** 65.0%
**Quality:** Fair
**Address:** 9800 South La Cienega Boulevard, Inglewood, CA 90301
**Coordinates:** 33.947070, -118.369543
**Geographic Spread:** Max 33m, Avg 33m between locations

**Providers:**
- **spothero**: 405 Airport Parking - Covered Self Park - $13.49/day
  - Address: 9800 South La Cienega Boulevard, Inglewood, CA 90301
  - Coordinates: 33.947217, -118.36952399999998
  - Amenities: self_park, covered, touchless, shuttle
- **cheap_airport_parking**: 405 Airport Parking - $18.43/day
  - Address: 9800 La Cienega Blvd., Inglewood, CA, 90301
  - Coordinates: 33.9469222, -118.3695611
  - Amenities: shuttle, covered, self-park

**Match Reasons:**
- Matched across 2 providers
- spothero: 405 Airport Parking - Covered Self Park
- cheap_airport_parking: 405 Airport Parking

---
