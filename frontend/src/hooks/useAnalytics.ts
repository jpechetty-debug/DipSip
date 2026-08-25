import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import type { ThresholdUpdate } from '../types/generated';

export const useOpportunityScore = () => {
  return useQuery({
    queryKey: ['analytics', 'opportunityScore'],
    queryFn: apiService.getOpportunityScore,
  });
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['settings', 'thresholds'],
    queryFn: apiService.getSettings,
  });

  const mutation = useMutation({
    mutationFn: (payload: ThresholdUpdate) => apiService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'thresholds'] });
      // Invalidating regime and score because thresholds affect them
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'regime'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'opportunityScore'] });
    },
  });

  return {
    ...query,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
