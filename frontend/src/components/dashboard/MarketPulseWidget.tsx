import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';

export function MarketPulseWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Market Pulse</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4 pb-6 space-y-4">
        
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Current Regime</span>
          <span className="px-3 py-1 rounded text-sm font-bold bg-warning/20 text-warning border border-warning/30">
            CORRECTION
          </span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Portfolio Drawdown</span>
          <span className="text-lg font-bold text-danger">-9.2%</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-gray-400 text-sm">Cash Ready</span>
          <span className="text-lg font-bold text-white">₹72,000</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Deployment Readiness</span>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-success">78%</span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="bg-success h-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}
