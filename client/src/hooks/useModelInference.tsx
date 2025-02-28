import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ModelRequestParams, ApiResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useModelMetadata } from '@/hooks/useModelMetadata';

// Error categories for better handling
enum ErrorCategory {
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  MODEL_LOADING = 'model_loading',
  MODEL_NOT_FOUND = 'model_not_found',
  INVALID_INPUT = 'invalid_input',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown'
}

interface ParsedError {
  message: string;
  category: ErrorCategory;
}

// Helper to parse error messages from the API
const parseErrorMessage = (error: unknown): ParsedError => {
  if (error instanceof Error) {
    const message = error.message;
    let category = ErrorCategory.UNKNOWN;
    let friendlyMessage = message;
    
    try {
      // Try to parse error as JSON if it contains JSON data
      if (message.includes('{') && message.includes('}')) {
        const jsonStartIndex = message.indexOf('{');
        const jsonStr = message.substring(jsonStartIndex);
        const errorData = JSON.parse(jsonStr);
        
        if (errorData.error) {
          // Extract specific error messages
          if (typeof errorData.error === 'string') {
            friendlyMessage = errorData.error;
            
            // Categorize error based on content
            if (errorData.error.includes('exceeded your monthly included credits') || 
                errorData.error.includes('rate limit')) {
              category = ErrorCategory.RATE_LIMIT;
              friendlyMessage = 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
            } else if (errorData.error.includes('currently loading') || 
                       errorData.error.includes('Model is loading')) {
              category = ErrorCategory.MODEL_LOADING;
              friendlyMessage = 'The model is currently loading. This may take a minute for larger models. Please try again shortly.';
            } else if (errorData.error.includes('not found') || 
                       errorData.error.includes('No such model')) {
              category = ErrorCategory.MODEL_NOT_FOUND;
              friendlyMessage = 'The selected model could not be found. Please try a different model.';
            } else if (errorData.error.includes('Invalid API token') || 
                       errorData.error.includes('Unauthorized') ||
                       errorData.error.includes('Authentication')) {
              category = ErrorCategory.AUTHENTICATION;
              friendlyMessage = 'Authentication error. Please check your API key and try again.';
            } else if (errorData.error.includes('Invalid input')) {
              category = ErrorCategory.INVALID_INPUT;
              friendlyMessage = 'Invalid input format. Please check your input and try again.';
            } else if (errorData.error.includes('Server error') || 
                       errorData.error.includes('Internal error')) {
              category = ErrorCategory.SERVER_ERROR;
              friendlyMessage = 'The Hugging Face server encountered an error. Please try again later.';
            }
          }
        }
      }
    } catch (e) {
      // Failed to parse as JSON, continue with string matching
    }
    
    // If not already categorized through JSON, try string matching
    if (category === ErrorCategory.UNKNOWN) {
      // Check for rate limit or subscription errors
      if (message.includes('exceeded your monthly included credits') || 
          message.includes('rate limit')) {
        category = ErrorCategory.RATE_LIMIT;
        friendlyMessage = 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
      }
      // Check for model loading errors
      else if (message.includes('Model is loading') || 
               message.includes('currently loading')) {
        category = ErrorCategory.MODEL_LOADING;
        friendlyMessage = 'The model is currently loading. This may take a minute for larger models. Please try again shortly.';
      }
      // Handle other common errors
      else if (message.includes('404') || 
               message.includes('not found')) {
        category = ErrorCategory.MODEL_NOT_FOUND;
        friendlyMessage = 'The selected model could not be found. Please try a different model.';
      }
      else if (message.includes('401') || 
               message.includes('403') ||
               message.includes('Unauthorized')) {
        category = ErrorCategory.AUTHENTICATION;
        friendlyMessage = 'Authentication error. Please check your API key and try again.';
      }
      else if (message.includes('Invalid input')) {
        category = ErrorCategory.INVALID_INPUT;
        friendlyMessage = 'Invalid input format. Please check your input and try again.';
      }
      else if (message.includes('Failed to fetch') || 
               message.includes('Network error') ||
               message.includes('CORS')) {
        category = ErrorCategory.NETWORK_ERROR;
        friendlyMessage = 'Network error. Check your internet connection and try again.';
      }
      else if (message.includes('500') || 
               message.includes('Server error')) {
        category = ErrorCategory.SERVER_ERROR;
        friendlyMessage = 'The Hugging Face server encountered an error. Please try again later.';
      }
    }
    
    return {
      message: friendlyMessage,
      category
    };
  }
  
  return {
    message: 'An unknown error occurred. Please try again.',
    category: ErrorCategory.UNKNOWN
  };
};

// Define hook return type for better type safety
interface ModelInferenceResult {
  inference: ReturnType<typeof useMutation<string, Error, ModelRequestParams>>;
  isLoading: boolean;
  error: Error | null;
  timestamp: string | null;
  responseTime: number | null;
  reset: () => void;
  retryCount: number;
}

export function useModelInference(): ModelInferenceResult {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isModelTool } = useModelMetadata();

  const displayErrorToast = useCallback((error: ParsedError) => {
    let title = "Error";
    let variant: "default" | "destructive" = "destructive";
    
    switch (error.category) {
      case ErrorCategory.RATE_LIMIT:
        title = "API Rate Limit";
        break;
      case ErrorCategory.AUTHENTICATION:
        title = "Authentication Error";
        break;
      case ErrorCategory.MODEL_LOADING:
        title = "Model Loading";
        variant = "default";
        break;
      case ErrorCategory.MODEL_NOT_FOUND:
        title = "Model Not Found";
        break;
      case ErrorCategory.INVALID_INPUT:
        title = "Invalid Input";
        break;
      case ErrorCategory.SERVER_ERROR:
        title = "Server Error";
        break;
      case ErrorCategory.NETWORK_ERROR:
        title = "Network Error";
        break;
      default:
        title = "Unexpected Error";
    }
    
    toast({
      title,
      description: error.message,
      variant
    });
  }, [toast]);

  // Define the mutation function with type safety
  const doModelInference = useCallback(async (params: ModelRequestParams): Promise<string> => {
    const startTime = Date.now();
    setRetryCount(0);
    
    // Check if API key is required but missing
    if (isModelTool(params.model) && (!params.apiKey || params.apiKey.trim() === '')) {
      const error = {
        message: 'API key is required for tool models. Please provide a valid Hugging Face API key.',
        category: ErrorCategory.AUTHENTICATION
      };
      displayErrorToast(error);
      throw new Error(error.message);
    }
    
    try {
      // Make API request to our backend
      const response = await apiRequest('POST', '/api/inference', params);
      const data = await response.json() as ApiResponse;
      
      // Calculate response time
      const endTime = Date.now();
      const timeTaken = data.timeTaken || (endTime - startTime) / 1000; // Use server time if available
      
      // Update timing information
      setResponseTime(timeTaken);
      setTimestamp(new Date().toLocaleString());
      
      // If successful, invalidate relevant queries to ensure fresh data
      // This is useful if we implement history or recent requests feature
      queryClient.invalidateQueries({ queryKey: ['/api/inference/recent'] });
      
      // Show success toast for particularly long-running operations
      if (timeTaken > 5) {
        toast({
          title: "Processing Complete",
          description: `Model inference completed in ${timeTaken.toFixed(1)} seconds`,
          variant: "default"
        });
      }
      
      return data.output;
    } catch (error) {
      // Parse and categorize the error
      const parsedError = parseErrorMessage(error);
      
      // For model loading errors, we can implement auto-retry logic
      if (parsedError.category === ErrorCategory.MODEL_LOADING && retryCount < 3) {
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Show toast for retry
        toast({
          title: "Retrying",
          description: `Model is still loading. Retrying (${retryCount + 1}/3)...`,
          variant: "default"
        });
        
        // Retry after a delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Recursive retry
        return doModelInference(params);
      }
      
      // Display appropriate error toast
      displayErrorToast(parsedError);
      
      // Record error in inference history if we implement that feature
      if (parsedError.category !== ErrorCategory.MODEL_LOADING) {
        queryClient.invalidateQueries({ queryKey: ['/api/inference/recent'] });
      }
      
      // Re-throw with the friendly message
      throw new Error(parsedError.message);
    }
  }, [isModelTool, displayErrorToast, queryClient, retryCount, toast]);

  // Use the mutation hook
  const inference = useMutation<string, Error, ModelRequestParams>({
    mutationFn: doModelInference
  });

  // Reset function
  const reset = useCallback(() => {
    inference.reset();
    setTimestamp(null);
    setResponseTime(null);
    setRetryCount(0);
  }, [inference]);

  return {
    inference,
    isLoading: inference.isPending,
    error: inference.error as Error | null,
    timestamp,
    responseTime,
    reset,
    retryCount
  };
}