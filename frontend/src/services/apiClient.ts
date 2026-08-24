import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token/key
apiClient.interceptors.request.use((config) => {
  const apiKey = useAuthStore.getState().apiKey;
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Mock interceptor
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

if (USE_MOCK_DATA) {
  apiClient.interceptors.request.use(async (config) => {
    // We simulate a network delay and intercept the request to return mock data
    // In a real robust mock setup we would use msw, but for this simple setup we can
    // just intercept here or use a wrapper around axios.
    // However, Axios interceptors can't easily return a mock response directly without adapters.
    // We'll handle mocks at the service layer functions instead for simplicity.
    return config;
  });
}

