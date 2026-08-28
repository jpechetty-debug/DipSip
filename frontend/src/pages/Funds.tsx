import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Card, CardContent } from '../components/shared/Card';
import { TrendingDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Funds() {
  const queryClient = useQueryClient();

  const { data: funds, isLoading } = useQuery({
    queryKey: ['funds'],
    queryFn: apiService.getFunds,
  });

  const createMutation = useMutation({
    mutationFn: (newFund: { name: string, target_weight: number }) => apiService.createFund(newFund),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      alert('Fund added successfully!');
    },
    onError: (err: any) => {
      alert(`Failed to add fund: ${err?.message}`);
    }
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-card rounded"></div>
      <div className="h-64 bg-card rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Funds Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor your target mutual funds</p>
        </div>
        <button 
          onClick={() => {
            const name = window.prompt("Enter new fund name:");
            if (!name) return;
            const weightStr = window.prompt("Enter target weight % (e.g. 20):");
            const target_weight = Number(weightStr) || 0;
            createMutation.mutate({ name, target_weight });
          }}
          disabled={createMutation.isPending}
          className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {createMutation.isPending ? 'Adding...' : '+ Add Fund'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {funds?.map((fund) => (
          <Link to={`/funds/${fund.id}`} key={fund.id}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{fund.name}</h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700 uppercase">
                      {fund.tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <div>Target Wgt: {fund.target_weight}%</div>
                    <div>Value: ₹{(fund.current_value || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Drawdown</div>
                    <div className={`font-semibold flex items-center justify-end ${(fund.drawdown_pct || 0) < -10 ? 'text-danger' : (fund.drawdown_pct || 0) < 0 ? 'text-warning' : 'text-success'}`}>
                      {(fund.drawdown_pct || 0) < 0 && <TrendingDown className="w-4 h-4 mr-1" />}
                      {fund.drawdown_pct}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Current NAV</div>
                    <div className="font-semibold text-white">₹{fund.current_nav}</div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
