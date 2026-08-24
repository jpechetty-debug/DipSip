import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';

export function OpportunityScoreWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Opportunity Score</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
        <div className="relative w-32 h-32 flex items-center justify-center mb-6 mt-4">
          {/* Simple SVG Donut Chart for Score */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#1F2937]"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-success"
              strokeDasharray="82, 100"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-4xl font-bold text-white">82</div>
        </div>
        
        <div className="text-center w-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-success mb-4 block">Status: Aggressive Deploy</span>
          
          <div className="w-full bg-[#111827] rounded-lg p-3 space-y-2 border border-[#1F2937]">
            <div className="text-xs text-gray-400 text-left mb-2">Suggested Allocation</div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300 truncate max-w-[120px]">Bandhan Small Cap</span>
              <span className="font-medium text-white">₹5,000</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300 truncate max-w-[120px]">Edelweiss Midcap</span>
              <span className="font-medium text-white">₹3,000</span>
            </div>
            <div className="flex justify-between items-center text-sm opacity-50">
              <span className="text-gray-300 truncate max-w-[120px]">PPFAS</span>
              <span className="font-medium text-white">₹0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
