import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import type * as Types from '../types/generated';
import { mockFunds, mockRecommendation } from '../mocks/data';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  getFunds: async (): Promise<Types.FundOut[]> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockFunds;
    }
    const { data } = await apiClient.get<Types.FundOut[]>(API_ENDPOINTS.FUNDS);
    return data;
  },

  getFundById: async (id: number): Promise<Types.FundOut> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      const fund = mockFunds.find(f => f.id === id);
      if (!fund) throw new Error('Fund not found');
      return fund;
    }
    const { data } = await apiClient.get<Types.FundOut>(API_ENDPOINTS.FUND_BY_ID(id));
    return data;
  },

  getDeploymentRecommendation: async (amount: number): Promise<Types.DeploymentRecommendationOut> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      return mockRecommendation;
    }
    const { data } = await apiClient.post<Types.DeploymentRecommendationOut>(
      API_ENDPOINTS.DEPLOYMENT_RECOMMENDATION, 
      { amount }
    );
    return data;
  },

  // Add more methods here as we build them out...
};
