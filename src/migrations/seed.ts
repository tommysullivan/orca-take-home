import { sql } from 'kysely';
import { db } from '../database';

// Sample location data with PostGIS POINT geometries
const sampleLocations = [
  {
    name: 'Statue of Liberty',
    latitude: 40.6892,
    longitude: -74.0445
  },
  {
    name: 'Central Park',
    latitude: 40.7851,
    longitude: -73.9683
  },
  {
    name: 'Brooklyn Bridge',
    latitude: 40.7061,
    longitude: -73.9969
  },
  {
    name: 'Times Square',
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    name: 'Empire State Building',
    latitude: 40.7484,
    longitude: -73.9857
  }
];

async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');
    
    for (const location of sampleLocations) {
      // Insert location using PostGIS ST_SetSRID and ST_MakePoint functions
      await db.insertInto('locations')
        .values({
          name: location.name,
          location: sql`ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)`
        })
        .execute();
      
      console.log(`Inserted location: ${location.name}`);
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();