import { 
  users, 
  inferenceRequests,
  type User,
  type InsertUser,
  type InferenceRequest,
  type InsertInferenceRequest,
  type UpdateInferenceRequest
} from "@shared/schema";
import type { DBUser } from "../shared/schema";
import { asc, desc, eq, and } from 'drizzle-orm';
import { log } from './vite';
import * as bcrypt from 'bcrypt';
import { db } from './db';

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<DBUser | undefined>; // Return internal user with password for auth
  createUser(user: InsertUser): Promise<User>;
  validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean>;
  updateLastLogin(userId: number): Promise<void>;
  
  // Inference request methods
  createInferenceRequest(request: InsertInferenceRequest): Promise<InferenceRequest>;
  updateInferenceRequest(id: number, update: UpdateInferenceRequest): Promise<InferenceRequest | undefined>;
  getRecentInferenceRequests(limit?: number): Promise<InferenceRequest[]>;
  getUserInferenceRequests(userId: number, limit?: number): Promise<InferenceRequest[]>;
}

// Database-backed storage implementation
export class DBStorage implements IStorage {
  
  constructor() {
    // Initialize the database
    log('Database storage initialized', 'storage');
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      log(`Error getting user by ID: ${error}`, 'storage');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<DBUser | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      log(`Error getting user by username: ${error}`, 'storage');
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      
      // Create user with hashed password
      const result = await db.insert(users).values({
        ...insertUser,
        password: hashedPassword
      }).returning();
      
      return result[0];
    } catch (error) {
      log(`Error creating user: ${error}`, 'storage');
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  async updateLastLogin(userId: number): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      log(`Error updating last login: ${error}`, 'storage');
    }
  }

  async createInferenceRequest(request: InsertInferenceRequest): Promise<InferenceRequest> {
    try {
      const result = await db.insert(inferenceRequests).values({
        ...request,
        timestamp: request.timestamp || new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      log(`Error creating inference request: ${error}`, 'storage');
      throw new Error(`Failed to create inference request: ${error}`);
    }
  }

  async updateInferenceRequest(id: number, update: UpdateInferenceRequest): Promise<InferenceRequest | undefined> {
    try {
      const result = await db.update(inferenceRequests)
        .set(update)
        .where(eq(inferenceRequests.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      log(`Error updating inference request: ${error}`, 'storage');
      return undefined;
    }
  }

  async getRecentInferenceRequests(limit = 10): Promise<InferenceRequest[]> {
    try {
      return await db.select()
        .from(inferenceRequests)
        .orderBy(desc(inferenceRequests.timestamp))
        .limit(limit);
    } catch (error) {
      log(`Error getting recent inference requests: ${error}`, 'storage');
      return [];
    }
  }

  async getUserInferenceRequests(userId: number, limit = 10): Promise<InferenceRequest[]> {
    try {
      return await db.select()
        .from(inferenceRequests)
        .where(eq(inferenceRequests.userId, userId))
        .orderBy(desc(inferenceRequests.timestamp))
        .limit(limit);
    } catch (error) {
      log(`Error getting user inference requests: ${error}`, 'storage');
      return [];
    }
  }
}

// Create and export the storage instance
export const storage = new DBStorage();
