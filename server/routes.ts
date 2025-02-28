import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { z } from "zod";
import passport from "passport";
import { loginUserSchema, insertUserSchema } from "@shared/schema";
import { initializeDB } from "./db";

// Validation schema for the inference request
const inferenceRequestSchema = z.object({
  model: z.string().min(1),
  apiKey: z.string().optional(),
  input: z.string().min(1),
  language: z.string(),
  params: z.object({
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().min(1).max(4096),
    top_p: z.number().min(0).max(1),
    frequency_penalty: z.number().min(0).max(2),
    presence_penalty: z.number().min(0).max(2),
    stop_sequences: z.string(),
  }),
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database
  await initializeDB();

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid request';
      res.status(400).json({ error: errorMessage });
    }
  });
  
  app.post('/api/auth/login', (req, res, next) => {
    try {
      // Validate request body
      loginUserSchema.parse(req.body);
      
      passport.authenticate('local', (err: Error, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ error: info.message || 'Authentication failed' });
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          
          return res.json({
            message: 'Login successful',
            user: userWithoutPassword
          });
        });
      })(req, res, next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid request';
      res.status(400).json({ error: errorMessage });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    const user = req.user as any;
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Endpoint for Hugging Face model inference
  app.post('/api/inference', isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validatedData = inferenceRequestSchema.parse(req.body);
      
      // Get the API key from request or environment variable
      let apiKey = validatedData.apiKey || process.env.HUGGINGFACE_API_KEY || '';
      
      // For development/demo purposes only - avoid 401 errors during testing
      if (!apiKey && process.env.NODE_ENV !== 'production') {
        // Use a fallback demo API key if available
        apiKey = process.env.HF_DEMO_API_KEY || '';
      }
      
      // Flag to determine if we should use mock data for development/testing
      const useMockData = !apiKey;
      
      // Determine the endpoint URL based on the model
      let endpoint = '';
      
      if (validatedData.model === 'custom') {
        // For custom models, the full URL is provided
        endpoint = `https://api-inference.huggingface.co/models/${validatedData.model}`;
      } else {
        // For predefined models, map to specific endpoints
        const modelEndpointMap: Record<string, string> = {
          'deepseek-coder': 'deepseek-ai/deepseek-coder-6.7b-instruct',
          'codellama': 'codellama/CodeLlama-7b-hf',
          'python-reviewer': 'elsanns/xwin-lm-7b-python-code-review',
          'chatbot': 'mistralai/Mistral-7B-Instruct-v0.2',
          'llama-cpp-agent': 'abacusai/Llama-2-70b-chat-hf',
          'code-review-chains': 'microsoft/CodeReviewer',
          'autocoder': 'replit/replit-code-v1-3b',
          'codestral-22b': 'mistralai/Codestral-22B-v0.1',
          'codeqwen-7b': 'Qwen/CodeQwen1.5-7B-Chat',
        };
        
        endpoint = `https://api-inference.huggingface.co/models/${modelEndpointMap[validatedData.model] || modelEndpointMap['chatbot']}`;
      }

      // Prepare the request payload based on the model parameters
      const payload = {
        inputs: validatedData.input,
        parameters: {
          temperature: validatedData.params.temperature,
          max_new_tokens: validatedData.params.max_tokens,
          top_p: validatedData.params.top_p,
          frequency_penalty: validatedData.params.frequency_penalty,
          presence_penalty: validatedData.params.presence_penalty,
          stop: validatedData.params.stop_sequences ? 
                validatedData.params.stop_sequences.split(',').map(s => s.trim()) : 
                undefined,
        },
        options: {
          use_cache: true,
          wait_for_model: true,
        }
      };

      // Log the inference request with the user ID
      const user = req.user as any;
      const inferenceRequest = await storage.createInferenceRequest({
        userId: user.id,
        model: validatedData.model,
        input: validatedData.input,
        params: validatedData.params,
        timestamp: new Date()
      });
      const inferenceId = inferenceRequest.id;

      // If in development mode and no API key, use mock data
      if (useMockData) {
        console.log('Using mock data for inference request - no API key available');
        
        // Simulate response time
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000; // Convert to seconds
        
        // Generate a mock response based on the input
        let mockOutput = '';
        if (validatedData.model.includes('code') || validatedData.language !== 'en') {
          // For code models
          mockOutput = `// This is a mock response for the ${validatedData.model} model\n// Your input: ${validatedData.input.substring(0, 50)}...\n\nfunction mockResponse() {\n  console.log("Hello from mock response!");\n  return "This is working in development mode";\n}`;
        } else {
          // For chat models
          mockOutput = `[MOCK RESPONSE - Dev Mode]\nYou asked: "${validatedData.input.substring(0, 50)}..."\n\nI'm a simulated response since no Hugging Face API key was provided. This is a development mode feature to test the application without requiring an actual API key.`;
        }
        
        // Update the inference request with the mock response
        await storage.updateInferenceRequest(inferenceId, {
          response: mockOutput,
          responseTime: Math.round(responseTime * 1000) // Convert to milliseconds
        });
        
        return res.json({
          output: mockOutput,
          model: `${validatedData.model} (MOCK)`,
          timeTaken: responseTime
        });
      }

      // Set up headers for the request
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add API key if provided
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      try {
        const startTime = Date.now();
        
        // Make the request to Hugging Face
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000; // Convert to seconds

        // Check if the request was successful
        if (!response.ok) {
          let errorData: string;
          let errorMessage: string;
          
          try {
            // Try to parse as JSON
            const errorJson = await response.json() as Record<string, unknown>;
            errorData = JSON.stringify(errorJson);
            
            // Format specific error messages
            if (errorJson.error && typeof errorJson.error === 'string') {
              if (errorJson.error.includes('exceeded your monthly included credits')) {
                errorMessage = 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
              } else if (errorJson.error.includes('currently loading')) {
                errorMessage = 'The model is currently loading. This may take a minute for larger models. Please try again shortly.';
              } else {
                errorMessage = errorJson.error;
              }
            } else {
              errorMessage = `Hugging Face API Error (${response.status})`;
            }
          } catch (e) {
            // If not JSON, treat as plain text
            errorData = await response.text();
            errorMessage = `Hugging Face API Error: ${errorData}`;
          }
          
          // Update the inference request with error information
          await storage.updateInferenceRequest(inferenceId, {
            error: errorMessage,
            responseTime: Math.round(responseTime * 1000) // Convert to milliseconds and round to integer
          });
          
          return res.status(response.status).json({
            error: errorMessage,
          });
        }

        // Parse the response data
        let data;
        try {
          data = await response.json();
        } catch (e) {
          // Handle non-JSON responses
          const textData = await response.text();
          
          // Update storage with error
          await storage.updateInferenceRequest(inferenceId, {
            error: `Invalid response format: ${textData.substring(0, 100)}...`,
            responseTime: Math.round(responseTime * 1000) // Convert to milliseconds and round to integer
          });
          
          return res.status(500).json({
            error: 'Model returned an invalid response format',
          });
        }
        
        // Extract the output based on the response format
        let output = '';
        
        if (Array.isArray(data)) {
          // Some models return an array of responses
          const firstItem = data[0] as Record<string, unknown>;
          if (firstItem && firstItem.generated_text) {
            output = String(firstItem.generated_text);
          } else {
            output = JSON.stringify(data, null, 2);
          }
        } else if (typeof data === 'object' && data !== null) {
          // Some models return an object with generated_text
          const responseObj = data as Record<string, unknown>;
          if (responseObj.generated_text) {
            output = String(responseObj.generated_text);
          } else {
            output = JSON.stringify(data, null, 2);
          }
        } else {
          // Fallback for other response formats
          output = JSON.stringify(data, null, 2);
        }

        // Convert responseTime to milliseconds for storage
        const responseTimeMs = Math.round(responseTime * 1000); 
        
        // Update the inference request with the response
        await storage.updateInferenceRequest(inferenceId, {
          response: output,
          responseTime: responseTimeMs
        });

        return res.json({
          output: output,
          model: validatedData.model,
          timeTaken: responseTime // Keep seconds for API response
        });
      } catch (fetchError) {
        const error = fetchError instanceof Error ? fetchError.message : 'Unknown error occurred';
        
        // Update the inference request with error information
        await storage.updateInferenceRequest(inferenceId, {
          error: `Fetch Error: ${error}`
        });
        
        return res.status(500).json({
          error: `Failed to fetch from Hugging Face API: ${error}`
        });
      }
    } catch (error) {
      // Handle validation errors or other exceptions
      const errorMessage = error instanceof Error ? error.message : 'Invalid request';
      return res.status(400).json({ error: errorMessage });
    }
  });

  // Get recent inference requests for the authenticated user
  app.get('/api/inference/history', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const history = await storage.getUserInferenceRequests(user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inference history' });
    }
  });
  
  // Get all inference requests (admin only)
  app.get('/api/inference/admin/history', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
      }
      
      const history = await storage.getRecentInferenceRequests(50); // Get more for admins
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inference history' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
