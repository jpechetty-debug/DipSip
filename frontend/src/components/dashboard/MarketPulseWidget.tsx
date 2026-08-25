import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { useRegime } from '../../hooks/usePortfolio';
import { useCashReserve } from '../../hooks/useCashReserve';

export function MarketPulseWidget() {
  const { data: regime, isLoading: isLoadingRegime } = useRegime();
  const { data: cash, isLoading: isLoadingCash } = useCashReserve();

  if (isLoadingRegime || isLoadingCash) {
    return (
      <Card className="flex flex-col h-full animate-pulse">
        <CardHeader>
          <CardTitle>Market Pulse</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  const drawdownPct = regime?.blended_drawdown_pct ?? 0;
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Market Pulse</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4 pb-6 space-y-4">
        
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Current Regime</span>
          <span className="px-3 py-1 rounded text-sm font-bold bg-warning/20 text-warning border border-warning/30">
            {regime?.regime_label?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Portfolio Drawdown</span>
          <span className="text-lg font-bold text-danger">{drawdownPct.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Cash Ready</span>
          <span className="text-lg font-bold text-white">₹{cash?.available_cash?.toLocaleString() || 0}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Deployment Readiness</span>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-success">
              {cash?.total_cash ? Math.round(((cash.total_cash - cash.emergency_reserve) / cash.total_cash) * 100) : 0}%
            </span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="bg-success h-full" style={{ width: `${cash?.total_cash ? Math.round(((cash.total_cash - cash.emergency_reserve) / cash.total_cash) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}
