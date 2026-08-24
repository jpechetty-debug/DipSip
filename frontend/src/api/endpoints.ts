export const API_ENDPOINTS = {
  FUNDS: '/funds',
  FUND_BY_ID: (id: number) => `/funds/${id}`,
  SCHEMES_SEARCH: '/funds/search/schemes',
  
  NAV: '/nav',
  NAV_HISTORY: (id: number) => `/nav/${id}/history`,
  
  DEPLOYMENT_RECOMMENDATION: '/deployment/recommendation',
  DEPLOYMENT_LOG: '/deployment/log',
  DEPLOYMENT_HISTORY: '/deployment/history',
  
  CASH: '/cash',
  CASH_ADD: '/cash/add',
  
  ANALYTICS_PORTFOLIO_XIRR: '/analytics/portfolio/xirr',
  ANALYTICS_PORTFOLIO_REGIME: '/analytics/portfolio/regime',
  ANALYTICS_FUND_XIRR: (id: number) => `/analytics/funds/${id}/xirr`,
  ANALYTICS_FUND_CYCLE: (id: number) => `/analytics/funds/${id}/cycle`,
  ANALYTICS_FUND_CYCLES: (id: number) => `/analytics/funds/${id}/cycles`,
  
  SETTINGS_THRESHOLDS: '/settings/thresholds',
  
  ALERTS: '/alerts',
  ALERT_ACK: (id: number) => `/alerts/${id}/ack`,
};
