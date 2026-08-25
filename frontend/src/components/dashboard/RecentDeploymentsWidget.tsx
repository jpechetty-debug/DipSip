import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { History, ArrowUpRight } from 'lucide-react';
import { useDeployments } from '../../hooks/useDeployments';
import { useFunds } from '../../hooks/useFunds';

export function RecentDeploymentsWidget() {
  const { data: deployments, isLoading: isLoadingDeps } = useDeployments();
  const { data: funds, isLoading: isLoadingFunds } = useFunds();

  if (isLoadingDeps || isLoadingFunds) {
    return (
      <Card className="flex flex-col h-full animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-400" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  // We want to flatten deployment items because the mockup showed individual funds
  const flattened = (deployments || []).flatMap(dep => {
    return dep.items.map(item => {
      const fund = funds?.find(f => f.id === item.fund_id);
      return {
        id: `${dep.id}-${item.fund_id}`,
        date: new Date(dep.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        fundName: fund?.name || `Fund #${item.fund_id}`,
        stage: fund?.tier?.toUpperCase() || 'UNKNOWN',
        amount: item.amount,
        gain: '+0.0%' // We don't have per-deployment gain in the backend right now, so we hardcode for UI mockup
      };
    });
  }).slice(0, 5); // Take top 5

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-400" />
          Recent Deployments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {flattened.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No deployments found
          </div>
        ) : (
          <div className="space-y-0">
            {flattened.map((dep, i) => (
              <div key={dep.id} className={`flex justify-between items-center py-3 ${i !== flattened.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div>
                  <div className="font-medium text-white text-sm">{dep.fundName}</div>
                  <div className="text-xs text-gray-400 mt-1">{dep.date} • {dep.stage}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">₹{dep.amount.toLocaleString()}</div>
                  <div className={`text-xs mt-1 flex items-center justify-end ${dep.gain.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                    {dep.gain.startsWith('+') && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                    {dep.gain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
