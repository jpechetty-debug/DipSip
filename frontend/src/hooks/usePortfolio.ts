import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

export const useRegime = () => {
  return useQuery({
    queryKey: ['portfolio', 'regime'],
    queryFn: apiService.getRegime,
  });
};
