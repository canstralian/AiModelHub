import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import fs from 'fs';
import { log } from './vite';
import { client } from './db';

// This is a simple migration script to push schema changes
async function runMigration() {
  try {
    log('Starting database migration', 'migration');
    
    const migrationClient = drizzle(client);
    
    log('Reading migration file', 'migration');
    const migrationSQL = fs.readFileSync('./migrations/0000_sad_fixer.sql', 'utf-8');
    
    log('Executing SQL migration', 'migration');
    // Execute the SQL directly
    await client.unsafe(migrationSQL);
    
    log('Migration completed successfully', 'migration');
    process.exit(0);
  } catch (error) {
    log(`Migration error: ${error}`, 'migration');
    process.exit(1);
  }
}

runMigration();