import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ModelRequestParams, ApiResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Helper to parse error messages from the API
const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for rate limit or subscription errors
    if (message.includes('exceeded your monthly included credits')) {
      return 'You have exceeded the free tier quota for Hugging Face API. Please use your own API key or try again later.';
    }
    
    // Check for model loading errors
    if (message.includes('Model is loading')) {
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
        
        // Show toast notification for certain errors
        if (friendlyMessage.includes('exceeded') || friendlyMessage.includes('loading')) {
          toast({
            title: "API Limitation",
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
