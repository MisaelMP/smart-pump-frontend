import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: Error) => {
        // Don't retry on 401/403 errors
        const httpError = error as { response?: { status?: number } };
        if (
          httpError.response?.status === 401 ||
          httpError.response?.status === 403
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: Error) => {
        // Don't retry mutations on client errors
        const httpError = error as { response?: { status?: number } };
        if (
          httpError.response?.status &&
          httpError.response.status >= 400 &&
          httpError.response.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
