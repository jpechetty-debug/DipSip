import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Shield, Zap, Calculator } from 'lucide-react';

export default function DeploymentCenter() {
  const [deploymentAmount, setDeploymentAmount] = useState<number>(10000);

  const { data: recommendation, isLoading } = useQuery({
    queryKey: ['deploymentRecommendation', deploymentAmount],
    queryFn: () => apiService.getDeploymentRecommendation(deploymentAmount),
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Deployment Center</h1>
        <p className="text-gray-400 text-sm mt-1">Calculate and execute intelligent capital deployments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target Deployment Amount (₹)</label>
                <input 
                  type="number" 
                  value={deploymentAmount}
                  onChange={(e) => setDeploymentAmount(Number(e.target.value))}
                  className="w-full bg-[#1F2937] border border-border rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <button className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-4 py-2 rounded-lg font-medium transition-colors">
                Recalculate
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-start space-x-3 bg-gray-800/50">
              <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-gray-200 mb-1">Rule Engine Active</div>
                <div className="text-gray-400">Allocations are calculated based on active drawdown triggers and target weights.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b border-border/50 bg-[#1F2937]/20 pb-4">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="flex items-center text-xl">
                  <Zap className="w-5 h-5 mr-2 text-warning" />
                  Proposed Allocations
                </CardTitle>
                <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all">
                  Execute All
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="h-12 bg-gray-800 rounded"></div>
                  <div className="h-12 bg-gray-800 rounded"></div>
                </div>
              ) : recommendation ? (
                <div className="divide-y divide-border">
                  {Object.entries(recommendation.allocations).map(([fundId, amount]) => (
                    amount > 0 && (
                      <div key={fundId} className="p-6 flex justify-between items-center hover:bg-[#1F2937]/30 transition-colors">
                        <div>
                          <div className="font-semibold text-lg text-white mb-1">Fund #{fundId}</div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <span className="px-2 py-0.5 rounded text-xs bg-danger/10 text-danger border border-danger/20 mr-2">BUY2</span>
                            Opportunity Score 82
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">₹{amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {((amount / deploymentAmount) * 100).toFixed(0)}% of total
                          </div>
                        </div>
                      </div>
                    )
                  ))}

                  {recommendation.leftover_unallocated > 0 && (
                    <div className="p-6 bg-warning/5 flex justify-between items-center">
                      <div className="text-warning font-medium">Unallocated (No triggers met)</div>
                      <div className="font-bold text-warning">₹{recommendation.leftover_unallocated.toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div className="p-6 bg-[#1F2937]/40 flex justify-between items-center border-t border-border shadow-inner">
                    <div className="font-semibold text-gray-300">Total Deployment</div>
                    <div className="font-bold text-xl text-primary">₹{(deploymentAmount - recommendation.leftover_unallocated).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  Enter an amount to see recommendations
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
