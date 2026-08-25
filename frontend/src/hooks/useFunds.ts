import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

export const useFunds = () => {
  return useQuery({
    queryKey: ['funds'],
    queryFn: apiService.getFunds,
  });
};

export const useFund = (id: number) => {
  return useQuery({
    queryKey: ['funds', id],
    queryFn: () => apiService.getFundById(id),
    enabled: !!id,
  });
};
