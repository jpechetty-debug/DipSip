import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import type * as Types from '../types/generated';
import { mockFunds, mockRecommendation, mockRegime, mockOpportunityScore, mockCash, mockDeployments, mockThresholds } from '../mocks/data';

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

  getRegime: async (): Promise<Types.RegimeOut> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockRegime as Types.RegimeOut;
    }
    const { data } = await apiClient.get<Types.RegimeOut>(API_ENDPOINTS.ANALYTICS_PORTFOLIO_REGIME);
    return data;
  },

  getOpportunityScore: async (): Promise<{ score: number }> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockOpportunityScore;
    }
    const { data } = await apiClient.get<{ score: number }>(API_ENDPOINTS.ANALYTICS_OPPORTUNITY_SCORE);
    return data;
  },

  getCash: async (): Promise<{ total_cash: number; emergency_reserve: number; available_cash: number }> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockCash;
    }
    const { data } = await apiClient.get(API_ENDPOINTS.CASH);
    return data;
  },

  getDeployments: async (): Promise<Types.DeploymentHistoryOut[]> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockDeployments;
    }
    const { data } = await apiClient.get<Types.DeploymentHistoryOut[]>(API_ENDPOINTS.DEPLOYMENT_HISTORY);
    return data;
  },

  getSettings: async (): Promise<Types.ThresholdUpdate> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockThresholds;
    }
    const { data } = await apiClient.get<Types.ThresholdUpdate>(API_ENDPOINTS.SETTINGS_THRESHOLDS);
    return data;
  },
  
  updateSettings: async (payload: Types.ThresholdUpdate): Promise<Types.ThresholdUpdate> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      return payload;
    }
    const { data } = await apiClient.put<Types.ThresholdUpdate>(API_ENDPOINTS.SETTINGS_THRESHOLDS, payload);
    return data;
  },

  updateCash: async (payload: Types.CashUpdate): Promise<any> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      return payload;
    }
    const { data } = await apiClient.put(API_ENDPOINTS.CASH, payload);
    return data;
  },

  createFund: async (payload: Types.FundCreate): Promise<Types.FundOut> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      return { ...payload, id: 99, reference_high_is_placeholder: false } as Types.FundOut;
    }
    const { data } = await apiClient.post<Types.FundOut>(API_ENDPOINTS.FUNDS, payload);
    return data;
  },

  updateFund: async (id: number, payload: Types.FundUpdate): Promise<Types.FundOut> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      const fund = mockFunds.find(f => f.id === id);
      return { ...fund, ...payload } as Types.FundOut;
    }
    const { data } = await apiClient.put<Types.FundOut>(API_ENDPOINTS.FUND_BY_ID(id), payload);
    return data;
  },

  searchSchemes: async (q: string): Promise<any[]> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return [
        { scheme_code: '119598', scheme_name: 'Bandhan Small Cap Fund - Direct Plan - Growth' },
        { scheme_code: '120503', scheme_name: 'SBI Small Cap Fund - Direct Plan - Growth' }
      ];
    }
    const { data } = await apiClient.get<any[]>(API_ENDPOINTS.SCHEMES_SEARCH, { params: { q } });
    return data;
  },

  logDeployment: async (payload: Types.DeploymentLogRequest): Promise<any> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      return { status: 'success', recorded: true };
    }
    const { data } = await apiClient.post(API_ENDPOINTS.DEPLOYMENT_LOG, payload);
    return data;
  },

  addCash: async (payload: Types.CashAddRequest): Promise<any> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { status: 'success' };
    }
    const { data } = await apiClient.post(API_ENDPOINTS.CASH_ADD, payload);
    return data;
  },

  addNavLog: async (payload: Types.NavLogCreate): Promise<any> => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { status: 'success' };
    }
    const { data } = await apiClient.post(API_ENDPOINTS.NAV, payload);
    return data;
  },

  ackAlert: async (id: number): Promise<any> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      return { status: 'success' };
    }
    const { data } = await apiClient.post(API_ENDPOINTS.ALERT_ACK(id));
    return data;
  }
};
