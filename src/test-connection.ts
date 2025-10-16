#!/usr/bin/env tsx
/**
 * Quick test to verify database connection and basic functionality
 * Run with: npm run test:connection
 */

import { db } from '../database';

async function testConnection(): Promise<void> {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const result = await db.selectFrom('information_schema.tables')
      .select(['table_name'])
      .where('table_schema', '=', 'public')
      .execute();
      
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${result.length} tables in public schema`);
    
    // Test PostGIS extension
    const postgisVersion = await db.selectFrom('information_schema.routines')
      .select(['routine_name'])
      .where('routine_name', '=', 'st_makepoint')
      .executeTakeFirst();
      
    if (postgisVersion) {
      console.log('🌍 PostGIS extension is available');
    } else {
      console.log('⚠️  PostGIS extension not detected');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

testConnection();