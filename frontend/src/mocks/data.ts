import { Types } from '../api/contracts';

export const mockFunds: Types.FundOut[] = [
  {
    id: 1,
    name: 'Bandhan Small Cap',
    target_weight: 40,
    current_value: 200000,
    reference_high_is_placeholder: false,
    current_nav: 120.5,
    drawdown_pct: -18.4,
    tier: 'buy2',
  },
  {
    id: 2,
    name: 'Edelweiss Midcap',
    target_weight: 30,
    current_value: 150000,
    reference_high_is_placeholder: false,
    current_nav: 85.2,
    drawdown_pct: -12.1,
    tier: 'buy1',
  },
  {
    id: 3,
    name: 'PPFAS',
    target_weight: 30,
    current_value: 132340,
    reference_high_is_placeholder: false,
    current_nav: 65.4,
    drawdown_pct: -4.2,
    tier: 'watch',
  },
];

export const mockRecommendation: Types.DeploymentRecommendationOut = {
  allocations: {
    '1': 5000,
    '2': 3000,
    '3': 0,
  },
  leftover_unallocated: 0,
  cash_check: {
    available_cash: 72000,
    amount_requested: 8000,
    sufficient: true,
  },
};

export const mockRegime: Types.RegimeOut = {
  regime: 'correction',
  regime_label: 'Correction',
  blended_drawdown_pct: -6.5,
};

export const mockCash = {
  total_cash: 100000,
  emergency_reserve: 28000,
  available_cash: 72000,
};

export const mockOpportunityScore = {
  score: 85,
};

export const mockDeployments: Types.DeploymentHistoryOut[] = [
  {
    id: 1,
    date: '2023-10-15',
    amount: 50000,
    notes: 'Initial seed',
    items: [{ fund_id: 1, amount: 20000 }, { fund_id: 2, amount: 30000 }]
  }
];

export const mockThresholds = {
  watch: -5,
  buy1: -8,
  buy2: -15,
  buy3: -25,
  regime_correction: -5,
  regime_bear: -10,
  regime_panic: -20,
};
