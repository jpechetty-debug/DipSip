import { API_ENDPOINTS } from './endpoints';
import type * as Types from '../types/generated';

// Re-export all types
export { Types };
export { API_ENDPOINTS };

// Generic response wrapper if the backend uses one (assuming direct return based on FastAPI structure)
export type ApiResponse<T> = T;
