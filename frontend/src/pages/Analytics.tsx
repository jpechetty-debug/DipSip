import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  
  const deploymentEfficiencyData = [
    { name: 'Jan', amount: 4000, efficiency: 8.4 },
    { name: 'Feb', amount: 3000, efficiency: 9.1 },
    { name: 'Mar', amount: 0, efficiency: 0 },
    { name: 'Apr', amount: 8000, efficiency: 14.2 },
    { name: 'May', amount: 15000, efficiency: 22.4 },
    { name: 'Jun', amount: 5000, efficiency: 11.2 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Review the efficiency and impact of your capital deployments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Deployment Efficiency by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deploymentEfficiencyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366F1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{fill: '#1F2937', opacity: 0.4}}
                  />
                  <Bar yAxisId="left" dataKey="amount" fill="#374151" radius={[4, 4, 0, 0]} />
                  {/* Using a secondary bar to represent efficiency score overlay */}
                  <Bar yAxisId="right" dataKey="efficiency" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Average Win Rate</div>
              <div className="text-3xl font-bold text-success">84%</div>
              <div className="text-xs text-gray-500 mt-1">Deployments yielding &gt; 5% in 90 days</div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="text-sm text-gray-400 mb-1">Total Deployed (YTD)</div>
              <div className="text-2xl font-bold text-white">₹35,000</div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm text-gray-400 mb-1">Estimated Alpha Generated</div>
              <div className="text-2xl font-bold text-primary">+4.2%</div>
              <div className="text-xs text-gray-500 mt-1">Vs generic SIP strategy</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
