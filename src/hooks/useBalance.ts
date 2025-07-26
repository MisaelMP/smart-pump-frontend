import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import type { BalanceInfo } from '@/types';

// Query keys for better organization
export const balanceKeys = {
  all: ['balance'] as const,
  detail: () => [...balanceKeys.all, 'detail'] as const,
};

// Custom hook for balance data
export const useBalance = () => {
  return useQuery({
    queryKey: balanceKeys.detail(),
    queryFn: async (): Promise<BalanceInfo> => {
      return await apiService.getUserBalance();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Custom hook for refreshing balance
export const useRefreshBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Force a fresh fetch from the server
      return await apiService.getUserBalance();
    },
    onSuccess: (data: BalanceInfo) => {
      // Update the cache with fresh data
      queryClient.setQueryData(balanceKeys.detail(), data);
    },
    onError: error => {
      console.error('Failed to refresh balance:', error);
    },
  });
};
