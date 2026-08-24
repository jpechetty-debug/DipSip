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
