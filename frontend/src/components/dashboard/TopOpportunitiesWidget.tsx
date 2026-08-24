import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/apiService';
import { TrendingDown } from 'lucide-react';

export function TopOpportunitiesWidget() {
  const { data: funds, isLoading } = useQuery({
    queryKey: ['funds'],
    queryFn: apiService.getFunds,
  });

  if (isLoading) return <Card className="animate-pulse h-64 bg-card/50" />;
  if (!funds) return null;

  // We sort by arbitrary score logic here for mock representation 
  // In reality, a "Score" field should come from backend. For now, rank by drawdown_pct
  const opportunities = [...funds]
    .filter(f => f.drawdown_pct && f.drawdown_pct < -2) // Only show down funds
    .sort((a, b) => (a.drawdown_pct || 0) - (b.drawdown_pct || 0))
    .slice(0, 4);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Top Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {opportunities.map((fund) => {
            // Mock score calculation based on drawdown for display
            const mockScore = Math.min(100, Math.abs(Math.round((fund.drawdown_pct || 0) * 4)));
            
            return (
              <div key={fund.id} className="flex justify-between items-center bg-[#1F2937]/30 p-3 rounded-lg border border-[#1F2937]/50">
                <div>
                  <div className="font-medium text-white mb-1">{fund.name}</div>
                  <div className="flex items-center text-xs text-danger">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {fund.drawdown_pct}%
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 mb-1">Score</span>
                  <span className={`font-bold ${mockScore > 70 ? 'text-success' : mockScore > 40 ? 'text-warning' : 'text-gray-300'}`}>
                    {mockScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
