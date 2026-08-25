import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import type { CashUpdate } from '../types/generated';

export const useCashReserve = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['cash'],
    queryFn: apiService.getCash,
  });

  const mutation = useMutation({
    mutationFn: (payload: CashUpdate) => apiService.updateCash(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] });
    },
  });

  return {
    ...query,
    updateCash: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
