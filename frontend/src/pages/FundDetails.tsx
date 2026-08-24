import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { ArrowLeft, TrendingDown, Clock, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function FundDetails() {
  const { id } = useParams();
  
  const { data: fund, isLoading } = useQuery({
    queryKey: ['fund', Number(id)],
    queryFn: () => apiService.getFundById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-card rounded"></div>
      <div className="h-96 bg-card rounded-xl"></div>
    </div>;
  }

  if (!fund) {
    return <div className="text-danger">Fund not found</div>;
  }

  // Mock chart data for visualization
  const mockChartData = Array.from({ length: 30 }).map((_, i) => {
    const day = 30 - i;
    // generate a downward trending curve to match current NAV
    const baseNav = fund.current_nav || 100;
    const value = baseNav * (1 + (day * 0.005) + (Math.random() * 0.02 - 0.01)); 
    return {
      name: `Day -${day}`,
      value: Number(value.toFixed(2)),
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <Link to="/funds" className="text-primary hover:text-primary/80 inline-flex items-center text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Funds
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{fund.name}</h1>
            <span className="px-3 py-1 rounded text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700 uppercase">
              {fund.tier}
            </span>
          </div>
          <p className="text-gray-400">Detailed performance and deployment metrics</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 transition-all">
          Deploy Capital
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-400 mb-1">Current NAV</div>
            <div className="text-2xl font-bold text-white">₹{fund.current_nav}</div>
          </CardContent>
        </Card>
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400 mb-1">Drawdown</div>
            <div className="text-2xl font-bold text-danger flex items-center">
              <TrendingDown className="w-5 h-5 mr-1" />
              {fund.drawdown_pct}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-400 mb-1">Target Weight</div>
            <div className="text-2xl font-bold text-white">{fund.target_weight}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-400 mb-1">Current Value</div>
            <div className="text-2xl font-bold text-white">₹{(fund.current_value || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drawdown Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff' }}
                  itemStyle={{ color: '#6366F1' }}
                />
                {/* Visualizing 5% drawdown threshold */}
                <ReferenceLine y={(fund.current_nav || 100) * 1.05} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'BUY1 Threshold', fill: '#EF4444', fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366F1', stroke: '#111827', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              Deployment Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-gray-300">BUY1 Trigger (5% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= -5 ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= -5 ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-gray-300">BUY2 Trigger (10% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= -10 ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= -10 ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">BUY3 Trigger (15% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= -15 ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= -15 ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-gray-400" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-400 block mb-1">Fund ID</span>
                <span className="text-white bg-gray-800 px-2 py-1 rounded font-mono">{fund.id}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400 block mb-1">Reference High</span>
                <span className="text-white">Calculated dynamically based on trailing ATH</span>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <button className="text-primary hover:text-primary/80 text-sm font-medium">Edit Configuration →</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
