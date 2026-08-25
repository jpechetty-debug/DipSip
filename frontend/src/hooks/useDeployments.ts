import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

export const useDeployments = () => {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: apiService.getDeployments,
  });
};

export const useDeploymentRecommendation = () => {
  return useMutation({
    mutationFn: (amount: number) => apiService.getDeploymentRecommendation(amount),
  });
};
