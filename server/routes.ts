import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import { z } from "zod";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint for Hugging Face model inference
  app.post('/api/inference', async (req, res) => {
    try {
      // Validate request body
      const validatedData = inferenceRequestSchema.parse(req.body);
      
      // Get the API key from request or environment variable
      const apiKey = validatedData.apiKey || process.env.HUGGINGFACE_API_KEY || '';
      
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

      // Log the inference request
      const inferenceRequest = await storage.createInferenceRequest({
        model: validatedData.model,
        input: validatedData.input,
        params: validatedData.params,
        timestamp: new Date()
      });
      const inferenceId = inferenceRequest.id;

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
          const errorData = await response.text();
          
          // Update the inference request with error information
          await storage.updateInferenceRequest(inferenceId, {
            error: `API Error: ${response.status} - ${errorData}`,
            responseTime
          });
          
          return res.status(response.status).json({
            error: `Hugging Face API Error: ${errorData}`,
          });
        }

        // Parse the response data
        const data = await response.json();
        
        // Extract the output based on the response format
        let output = '';
        
        if (Array.isArray(data)) {
          // Some models return an array of responses
          if (data[0] && typeof data[0].generated_text === 'string') {
            output = data[0].generated_text;
          } else {
            output = JSON.stringify(data, null, 2);
          }
        } else if (typeof data === 'object' && data !== null) {
          // Some models return an object with generated_text
          if (typeof data.generated_text === 'string') {
            output = data.generated_text;
          } else {
            output = JSON.stringify(data, null, 2);
          }
        } else {
          // Fallback for other response formats
          output = JSON.stringify(data, null, 2);
        }

        // Update the inference request with the response
        await storage.updateInferenceRequest(inferenceId, {
          response: output,
          responseTime
        });

        return res.json({
          output: output,
          model: validatedData.model,
          timeTaken: responseTime
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

  // Get recent inference requests
  app.get('/api/inference/history', async (req, res) => {
    try {
      const history = await storage.getRecentInferenceRequests();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inference history' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
