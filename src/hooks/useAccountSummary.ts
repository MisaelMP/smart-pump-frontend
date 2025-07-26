import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import type { AccountSummary } from '@/types';

// Query keys for account summary
export const accountKeys = {
  all: ['account'] as const,
  summary: () => [...accountKeys.all, 'summary'] as const,
};

// Custom hook for account summary data
export const useAccountSummary = () => {
  return useQuery({
    queryKey: accountKeys.summary(),
    queryFn: async (): Promise<AccountSummary> => {
      return await apiService.getAccountSummary();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
