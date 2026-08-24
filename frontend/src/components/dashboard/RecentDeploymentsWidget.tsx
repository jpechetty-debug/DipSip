import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { History, ArrowUpRight } from 'lucide-react';

export function RecentDeploymentsWidget() {
  const deployments = [
    { id: 1, date: '14 Jun 2026', fund: 'Bandhan Small Cap', stage: 'BUY1', amount: 5000, gain: '+11.2%' },
    { id: 2, date: '02 Jul 2026', fund: 'Edelweiss Midcap', stage: 'BUY2', amount: 10000, gain: '+4.5%' },
    { id: 3, date: '18 Jul 2026', fund: 'PPFAS', stage: 'BUY1', amount: 8000, gain: '-1.2%' },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-400" />
          Recent Deployments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-0">
          {deployments.map((dep, i) => (
            <div key={dep.id} className={`flex justify-between items-center py-3 ${i !== deployments.length -1 ? 'border-b border-border/50' : ''}`}>
              <div>
                <div className="font-medium text-white text-sm">{dep.fund}</div>
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
      </CardContent>
    </Card>
  );
}
