import { Card, CardContent } from '../shared/Card';
import { ArrowRight, TrendingDown, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/apiService';

export function RecommendationHero() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['deploymentRecommendation', 8000], // Example amount, ideally dynamic
    queryFn: () => apiService.getDeploymentRecommendation(8000),
  });

  const deployMutation = useMutation({
    mutationFn: (amount: number) => apiService.logDeployment({ amount, force: false }),
    onSuccess: () => {
      alert('Deployment logged successfully!');
      // Invalidate relevant queries to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['cash'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
    },
    onError: (err: any) => {
      alert(`Failed to log deployment: ${err?.message || 'Unknown error'}`);
    }
  });

  if (isLoading) return <Card className="animate-pulse h-48 bg-card/50" />;
  if (error) return <Card className="h-48 flex items-center justify-center text-danger border-danger/50">Failed to load recommendation.</Card>;
  if (!data) return null;

  // For this hero, we'll pick the top allocated fund
  const topAllocationId = Object.keys(data.allocations).reduce((a, b) => data.allocations[a] > data.allocations[b] ? a : b, '');
  const topAmount = data.allocations[topAllocationId] || 0;

  return (
    <Card className="bg-gradient-to-br from-primary/20 to-background border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap size={120} />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm flex items-center">
              <Zap className="w-4 h-4 mr-2" /> Today's Recommendation
            </h2>
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-white">Deploy ₹{topAmount.toLocaleString()}</span>
              <span className="text-xl text-gray-300">into Fund #{topAllocationId}</span>
            </div>
            
            <div className="flex gap-4 pt-4">
              <div className="flex items-center text-sm text-danger bg-danger/10 px-3 py-1.5 rounded-md">
                <TrendingDown className="w-4 h-4 mr-2" />
                BUY2 Triggered
              </div>
              <div className="flex items-center text-sm text-success bg-success/10 px-3 py-1.5 rounded-md">
                Opportunity Score 82
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to deploy ₹${topAmount}?`)) {
                deployMutation.mutate(topAmount);
              }
            }}
            disabled={deployMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all flex items-center disabled:opacity-50"
          >
            {deployMutation.isPending ? 'Executing...' : 'Execute Deployment'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
