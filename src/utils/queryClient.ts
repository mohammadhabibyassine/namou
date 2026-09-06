import { QueryClient } from "@tanstack/react-query";
import {
  getHttpStatus,
  isNetworkError,
  isRequestCanceled,
} from "./errorHandler";

const MAX_QUERY_RETRIES = 2;

export const shouldRetryQuery = (
  failureCount: number,
  error: unknown,
): boolean => {
  if (failureCount >= MAX_QUERY_RETRIES || isRequestCanceled(error)) {
    return false;
  }

  const status = getHttpStatus(error);

  if (status === null) {
    return isNetworkError(error);
  }

  // Retry on rate limit, timeout, or server errors
  return status === 408 || status === 429 || status >= 500;
};

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: shouldRetryQuery,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Default singleton instance for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
};
