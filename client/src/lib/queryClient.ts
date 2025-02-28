import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  method: string;
  url: string;
  data?: unknown;
  on401?: "returnNull" | "throw";
}

/**
 * Enhanced API request function that handles authentication and JSON parsing
 */
export async function apiRequest<T = any>(options: ApiRequestOptions): Promise<T> {
  const { method, url, data, on401 = "throw" } = options;
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle 401 unauthorized based on the option
  if (res.status === 401 && on401 === "returnNull") {
    return null as any;
  }

  await throwIfResNotOk(res);
  
  // Only try to parse JSON if there's content
  if (res.status !== 204) {
    return await res.json();
  }
  
  // For 204 No Content responses
  return {} as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    return apiRequest<T>({
      method: 'GET',
      url: queryKey[0] as string,
      on401: options.on401
    });
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
