import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Shield, AlertTriangle } from 'lucide-react';
import { useCashReserve } from '../../hooks/useCashReserve';

export function CashReserveWidget() {
  const { data: cash, isLoading } = useCashReserve();

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full animate-pulse">
        <CardHeader>
          <CardTitle>Cash Reserve</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  const available = cash?.available_cash || 0;
  const total = cash?.total_cash || 1; // prevent div by zero
  const capacityPct = Math.round((available / total) * 100);
  const isHealthy = capacityPct >= 20; // arbitrary rule for mock

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Cash Reserve</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4">
        
        <div className="space-y-1 mb-6">
          <div className="text-gray-400 text-sm">Available Cash</div>
          <div className="text-3xl font-bold text-white">₹{available.toLocaleString()}</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">Deployment Capacity</span>
              <span className="text-white font-medium">{capacityPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: `${capacityPct}%` }}></div>
              <div className="bg-gray-600 h-full border-l border-gray-800" style={{ width: `${100 - capacityPct}%` }}></div>
            </div>
          </div>
          
          <div className={`${isHealthy ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'} border rounded p-3 flex items-start space-x-3`}>
            {isHealthy ? (
              <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <div className={`${isHealthy ? 'text-success' : 'text-warning'} font-medium mb-1`}>
                {isHealthy ? 'Reserve Status Healthy' : 'Reserve Status Low'}
              </div>
              <div className="text-gray-300 text-xs">
                {isHealthy ? 'Available for major market corrections based on current rules.' : 'Consider topping up your cash reserve.'}
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
