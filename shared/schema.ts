import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Model Parameters schema
export const modelParamsSchema = z.object({
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(4096),
  top_p: z.number().min(0).max(1),
  frequency_penalty: z.number().min(0).max(2),
  presence_penalty: z.number().min(0).max(2),
  stop_sequences: z.string(),
});

export type ModelParams = z.infer<typeof modelParamsSchema>;

// Inference Request schema
export const inferenceRequests = pgTable("inference_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  model: text("model").notNull(),
  input: text("input").notNull(),
  params: jsonb("params").$type<ModelParams>().notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  response: text("response"),
  error: text("error"),
  responseTime: integer("response_time"),
});

export const insertInferenceRequestSchema = createInsertSchema(inferenceRequests)
  .pick({
    userId: true,
    model: true,
    input: true,
    params: true,
    timestamp: true,
  });

export const updateInferenceRequestSchema = z.object({
  response: z.string().optional(),
  error: z.string().optional(),
  responseTime: z.number().optional(),
});

export type InsertInferenceRequest = z.infer<typeof insertInferenceRequestSchema>;
export type UpdateInferenceRequest = z.infer<typeof updateInferenceRequestSchema>;
export type InferenceRequest = typeof inferenceRequests.$inferSelect;
