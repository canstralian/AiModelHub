import { 
  users, 
  type User, 
  type InsertUser,
  type InferenceRequest,
  type InsertInferenceRequest,
  type UpdateInferenceRequest
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inference request methods
  createInferenceRequest(request: InsertInferenceRequest): Promise<InferenceRequest>;
  updateInferenceRequest(id: number, update: UpdateInferenceRequest): Promise<InferenceRequest | undefined>;
  getRecentInferenceRequests(limit?: number): Promise<InferenceRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inferenceRequests: Map<number, InferenceRequest>;
  private userCurrentId: number;
  private inferenceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.inferenceRequests = new Map();
    this.userCurrentId = 1;
    this.inferenceCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createInferenceRequest(request: InsertInferenceRequest): Promise<InferenceRequest> {
    const id = this.inferenceCurrentId++;
    const inferenceRequest: InferenceRequest = {
      ...request,
      id,
      timestamp: request.timestamp || new Date(),
      response: undefined,
      error: undefined,
      responseTime: undefined
    };
    this.inferenceRequests.set(id, inferenceRequest);
    return inferenceRequest;
  }

  async updateInferenceRequest(id: number, update: UpdateInferenceRequest): Promise<InferenceRequest | undefined> {
    const existingRequest = this.inferenceRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }

    const updatedRequest: InferenceRequest = {
      ...existingRequest,
      ...update
    };
    
    this.inferenceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getRecentInferenceRequests(limit = 10): Promise<InferenceRequest[]> {
    const requests = Array.from(this.inferenceRequests.values());
    return requests
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
