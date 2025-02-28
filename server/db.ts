import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, inferenceRequests } from '@shared/schema';
import { log } from './vite';

// Create a postgres client
const connectionString = process.env.DATABASE_URL as string;
export const client = postgres(connectionString);

// Create a drizzle client
export const db = drizzle(client);

// Initialize database function
export async function initializeDB() {
  try {
    log('Starting database initialization', 'db');
    
    // This will be handled by drizzle-kit migrations
    // We're just logging some info about the tables

    log('Database initialized successfully', 'db');
    
    return true;
  } catch (error) {
    log(`Database initialization error: ${error}`, 'db');
    return false;
  }
}