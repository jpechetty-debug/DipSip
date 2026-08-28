export interface FundCreate {
  name: string;
  scheme_code?: string;
  target_weight?: number;
  current_value?: number;
  reference_high?: number;
  ladder_watch_budget?: number;
  ladder_buy1_budget?: number;
  ladder_buy2_budget?: number;
  ladder_buy3_budget?: number;
  threshold_watch?: number;
  threshold_buy1?: number;
  threshold_buy2?: number;
  threshold_buy3?: number;
}

export interface FundUpdate {
  name?: string;
  scheme_code?: string;
  target_weight?: number;
  current_value?: number;
  reference_high?: number;
  seed_value?: number;
  seed_date?: string;
  ladder_watch_budget?: number;
  ladder_buy1_budget?: number;
  ladder_buy2_budget?: number;
  ladder_buy3_budget?: number;
  threshold_watch?: number;
  threshold_buy1?: number;
  threshold_buy2?: number;
  threshold_buy3?: number;
}

export interface FundOut {
  id: number;
  name: string;
  scheme_code?: string;
  target_weight: number;
  current_value: number;
  reference_high?: number;
  reference_high_is_placeholder: boolean;
  current_nav?: number;
  drawdown_pct?: number;
  tier?: string; // 'neutral', 'watch', 'buy1', 'buy2', 'buy3'
  seed_value?: number;
  seed_date?: string;
  ladder_watch_budget?: number;
  ladder_buy1_budget?: number;
  ladder_buy2_budget?: number;
  ladder_buy3_budget?: number;
  threshold_watch?: number;
  threshold_buy1?: number;
  threshold_buy2?: number;
  threshold_buy3?: number;
  effective_thresholds?: Record<string, number>;
}

export interface NavLogCreate {
  fund_id: number;
  date?: string;
  nav: number;
}

export interface ThresholdUpdate {
  watch?: number;
  buy1?: number;
  buy2?: number;
  buy3?: number;
  regime_correction?: number;
  regime_bear?: number;
  regime_panic?: number;
}

export interface DeploymentRequest {
  amount: number;
}

export interface DeploymentLogRequest {
  amount: number;
  notes?: string;
  force?: boolean;
}

export interface CashUpdate {
  total_cash?: number;
  emergency_reserve?: number;
}

export interface CashAddRequest {
  amount: number;
}

export interface DeploymentItemOut {
  fund_id: number;
  amount: number;
}

export interface DeploymentHistoryOut {
  id: number;
  date: string;
  amount: number;
  notes?: string;
  items: DeploymentItemOut[];
}

export interface DeploymentRecommendationOut {
  allocations: Record<string, number>;
  leftover_unallocated: number;
  cash_check: {
    available_cash: number;
    amount_requested: number;
    sufficient: boolean;
  };
}

export interface AnalyticsXIRROut {
  fund_id?: number;
  xirr_pct: number | null;
  as_of: string;
  cashflow_count?: number;
  note?: string;
}

export interface RegimeOut {
  regime: string;
  regime_label: string;
  blended_drawdown_pct: number;
  cycle?: any; 
}
