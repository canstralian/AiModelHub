import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ModelRequestParams, ApiResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Helper to parse error messages from the API
const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message;
    
    try {
      // Try to parse error as JSON if it contains JSON data
      if (message.includes('{') && message.includes('}')) {
        const jsonStartIndex = message.indexOf('{');
        const jsonStr = message.substring(jsonStartIndex);
        const errorData = JSON.parse(jsonStr);
        
        if (errorData.error) {
          // Extract specific error messages
          if (typeof errorData.error === 'string') {
            // Check for rate limit or subscription errors
            if (errorData.error.includes('exceeded your monthly included credits')) {
              return 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
            }
            
            // Check for model loading errors
            if (errorData.error.includes('currently loading')) {
              return 'The model is currently loading. This may take a minute for larger models. Please try again shortly.';
            }
            
            return errorData.error;
          }
        }
      }
    } catch (e) {
      // Failed to parse as JSON, continue with string matching
    }
    
    // Check for rate limit or subscription errors
    if (message.includes('exceeded your monthly included credits')) {
      return 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
    }
    
    // Check for model loading errors
    if (message.includes('Model is loading') || message.includes('currently loading')) {
      return 'The model is currently loading. This may take a minute for larger models. Please try again shortly.';
    }
    
    // Handle other common errors
    if (message.includes('404')) {
      return 'The selected model could not be found. Please try a different model.';
    }
    
    if (message.includes('401') || message.includes('403')) {
      return 'Authentication error. Please check your API key and try again.';
    }
    
    // Return the raw error message if we don't have a specific handler
    return message;
  }
  
  return 'An unknown error occurred. Please try again.';
};

export function useModelInference() {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const { toast } = useToast();

  const inference = useMutation({
    mutationFn: async (params: ModelRequestParams) => {
      const startTime = Date.now();
      
      try {
        // Make API request
        const response = await apiRequest('POST', '/api/inference', params);
        const data = await response.json() as ApiResponse;
        
        // Calculate response time
        const endTime = Date.now();
        const timeTaken = data.timeTaken || (endTime - startTime) / 1000; // Use server time if available
        
        // Update timing information
        setResponseTime(timeTaken);
        setTimestamp(new Date().toLocaleString());
        
        return data.output;
      } catch (error) {
        // Format user-friendly error message
        const friendlyMessage = parseErrorMessage(error);
        
        // Show toast notification for different error types
        if (friendlyMessage.includes('exceeded')) {
          toast({
            title: "API Rate Limit",
            description: friendlyMessage,
            variant: "destructive"
          });
        } else if (friendlyMessage.includes('loading')) {
          toast({
            title: "Model Loading",
            description: friendlyMessage,
            variant: "default"
          });
        } else if (friendlyMessage.includes('Authentication') || friendlyMessage.includes('API key')) {
          toast({
            title: "Authentication Error",
            description: friendlyMessage,
            variant: "destructive"
          });
        } else if (friendlyMessage.includes('could not be found')) {
          toast({
            title: "Model Not Found",
            description: friendlyMessage,
            variant: "destructive"
          });
        }
        
        // Re-throw with the friendly message
        throw new Error(friendlyMessage);
      }
    }
  });

  const reset = () => {
    inference.reset();
    setTimestamp(null);
    setResponseTime(null);
  };

  return {
    inference,
    isLoading: inference.isPending,
    error: inference.error as Error | null,
    timestamp,
    responseTime,
    reset
  };
}
