import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ModelRequestParams } from '@/lib/types';

export function useModelInference() {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const inference = useMutation({
    mutationFn: async (params: ModelRequestParams) => {
      const startTime = Date.now();
      
      // Make API request
      const response = await apiRequest('POST', '/api/inference', params);
      const data = await response.json();
      
      // Calculate response time
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
      
      // Update timing information
      setResponseTime(timeTaken);
      setTimestamp(new Date().toLocaleString());
      
      return data.output;
    }
  });

  const reset = () => {
    inference.reset();
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
