import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { log } from './vite';

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
export const client = postgres(connectionString);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Initialize database function
export async function initializeDB() {
  try {
    log('Starting database initialization', 'db');
    
    // You could run checks or initialization logic here
    // For now, we'll just make a simple query to verify the connection
    await db.query.users.findMany({ limit: 1 });
    
    log('Database initialized successfully', 'db');
  } catch (error) {
    log(`Database initialization error: ${error}`, 'db');
    throw error;
  }
}