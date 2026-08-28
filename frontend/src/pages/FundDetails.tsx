import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { ArrowLeft, TrendingDown, Clock, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function FundDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    threshold_watch: '',
    threshold_buy1: '',
    threshold_buy2: '',
    threshold_buy3: '',
    ladder_watch_budget: '',
    ladder_buy1_budget: '',
    ladder_buy2_budget: '',
    ladder_buy3_budget: '',
  });
  
  const { data: fund, isLoading } = useQuery({
    queryKey: ['fund', Number(id)],
    queryFn: () => apiService.getFundById(Number(id)),
    enabled: !!id,
  });

  const { data: navHistory } = useQuery({
    queryKey: ['navHistory', Number(id)],
    queryFn: () => apiService.getNavHistory(Number(id)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: any) => apiService.updateFund(Number(id), updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund', Number(id)] });
      setIsEditing(false);
    }
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

  // Real NAV history from the backend, oldest to newest. Empty until the
  // daily scheduler (or a manual /nav log) has actually recorded some
  // points — an empty chart is more honest than a fabricated curve.
  const chartData = (navHistory ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ name: log.date, value: log.nav }));

  const buy1Threshold = fund.effective_thresholds?.buy1 ?? -5;
  const buy2Threshold = fund.effective_thresholds?.buy2 ?? -10;
  const buy3Threshold = fund.effective_thresholds?.buy3 ?? -15;

  // For visualization, we calculate the NAV corresponding to the buy1 drawdown threshold
  const referenceHigh = fund.reference_high || (fund.current_nav ? fund.current_nav / (1 + ((fund.drawdown_pct || 0) / 100)) : 100);
  const buy1NavThreshold = referenceHigh * (1 + (buy1Threshold / 100));


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
            {chartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                No NAV history yet — this fills in once the daily scheduler runs.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff' }}
                  itemStyle={{ color: '#6366F1' }}
                />
                {/* Visualizing BUY1 drawdown threshold */}
                <ReferenceLine y={buy1NavThreshold} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: `BUY1 Threshold (${Math.abs(buy1Threshold)}% drop)`, fill: '#EF4444', fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366F1', stroke: '#111827', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
            )}
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
                <span className="text-gray-300">BUY1 Trigger ({Math.abs(buy1Threshold)}% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= buy1Threshold ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= buy1Threshold ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-gray-300">BUY2 Trigger ({Math.abs(buy2Threshold)}% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= buy2Threshold ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= buy2Threshold ? 'ACTIVE' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">BUY3 Trigger ({Math.abs(buy3Threshold)}% drop)</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${(fund.drawdown_pct || 0) <= buy3Threshold ? 'bg-success/20 text-success' : 'bg-gray-800 text-gray-400'}`}>
                  {(fund.drawdown_pct || 0) <= buy3Threshold ? 'ACTIVE' : 'PENDING'}
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
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Watch Threshold</label>
                    <input 
                      type="number" 
                      placeholder={fund.effective_thresholds?.watch?.toString() || "-5"} 
                      value={editForm.threshold_watch} 
                      onChange={(e) => setEditForm(prev => ({...prev, threshold_watch: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY1 Threshold</label>
                    <input 
                      type="number" 
                      placeholder={fund.effective_thresholds?.buy1?.toString() || "-8"} 
                      value={editForm.threshold_buy1} 
                      onChange={(e) => setEditForm(prev => ({...prev, threshold_buy1: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY2 Threshold</label>
                    <input 
                      type="number" 
                      placeholder={fund.effective_thresholds?.buy2?.toString() || "-15"} 
                      value={editForm.threshold_buy2} 
                      onChange={(e) => setEditForm(prev => ({...prev, threshold_buy2: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY3 Threshold</label>
                    <input 
                      type="number" 
                      placeholder={fund.effective_thresholds?.buy3?.toString() || "-25"} 
                      value={editForm.threshold_buy3} 
                      onChange={(e) => setEditForm(prev => ({...prev, threshold_buy3: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                </div>

                <div className="text-sm font-semibold text-white mt-4 mb-2">Ladder Budgets (₹)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Watch Budget</label>
                    <input 
                      type="number" 
                      placeholder="No limit" 
                      value={editForm.ladder_watch_budget} 
                      onChange={(e) => setEditForm(prev => ({...prev, ladder_watch_budget: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY1 Budget</label>
                    <input 
                      type="number" 
                      placeholder="No limit" 
                      value={editForm.ladder_buy1_budget} 
                      onChange={(e) => setEditForm(prev => ({...prev, ladder_buy1_budget: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY2 Budget</label>
                    <input 
                      type="number" 
                      placeholder="No limit" 
                      value={editForm.ladder_buy2_budget} 
                      onChange={(e) => setEditForm(prev => ({...prev, ladder_buy2_budget: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">BUY3 Budget</label>
                    <input 
                      type="number" 
                      placeholder="No limit" 
                      value={editForm.ladder_buy3_budget} 
                      onChange={(e) => setEditForm(prev => ({...prev, ladder_buy3_budget: e.target.value}))}
                      className="w-full bg-[#111827] border border-border rounded px-2 py-1 text-sm text-white" 
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 pt-4 border-t border-border">
                  <button 
                    onClick={() => {
                      const updates: any = {};
                      if (editForm.threshold_watch) updates.threshold_watch = Number(editForm.threshold_watch);
                      if (editForm.threshold_buy1) updates.threshold_buy1 = Number(editForm.threshold_buy1);
                      if (editForm.threshold_buy2) updates.threshold_buy2 = Number(editForm.threshold_buy2);
                      if (editForm.threshold_buy3) updates.threshold_buy3 = Number(editForm.threshold_buy3);
                      
                      // For budgets, we allow empty strings to clear the budget (sending null), 
                      // but since we only send defined updates, we might need a way to clear them.
                      // For now, if there is a value we send it.
                      if (editForm.ladder_watch_budget) updates.ladder_watch_budget = Number(editForm.ladder_watch_budget);
                      if (editForm.ladder_buy1_budget) updates.ladder_buy1_budget = Number(editForm.ladder_buy1_budget);
                      if (editForm.ladder_buy2_budget) updates.ladder_buy2_budget = Number(editForm.ladder_buy2_budget);
                      if (editForm.ladder_buy3_budget) updates.ladder_buy3_budget = Number(editForm.ladder_buy3_budget);

                      updateMutation.mutate(updates);
                    }}
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-400 block mb-1">Fund ID</span>
                  <span className="text-white bg-gray-800 px-2 py-1 rounded font-mono">{fund.id}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block mb-1">Reference High</span>
                  <span className="text-white">Calculated dynamically based on trailing ATH</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block mb-1">Threshold Overrides</span>
                  <span className="text-gray-300 text-xs">
                    {fund.threshold_buy1 || fund.threshold_buy2 || fund.threshold_buy3 || fund.threshold_watch 
                      ? "Custom fund thresholds active" 
                      : "Using global defaults"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400 block mb-1">Ladder Budgets</span>
                  <span className="text-gray-300 text-xs">
                    {fund.ladder_buy1_budget || fund.ladder_buy2_budget || fund.ladder_buy3_budget || fund.ladder_watch_budget 
                      ? "Custom budgets active" 
                      : "Unbounded"}
                  </span>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <button 
                    onClick={() => {
                      setEditForm({
                        threshold_watch: fund.threshold_watch?.toString() || '',
                        threshold_buy1: fund.threshold_buy1?.toString() || '',
                        threshold_buy2: fund.threshold_buy2?.toString() || '',
                        threshold_buy3: fund.threshold_buy3?.toString() || '',
                        ladder_watch_budget: fund.ladder_watch_budget?.toString() || '',
                        ladder_buy1_budget: fund.ladder_buy1_budget?.toString() || '',
                        ladder_buy2_budget: fund.ladder_buy2_budget?.toString() || '',
                        ladder_buy3_budget: fund.ladder_buy3_budget?.toString() || '',
                      });
                      setIsEditing(true);
                    }}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Edit Configuration →
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
