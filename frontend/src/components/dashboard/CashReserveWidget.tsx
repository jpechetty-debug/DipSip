import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { Shield } from 'lucide-react';

export function CashReserveWidget() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Cash Reserve</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-4">
        
        <div className="space-y-1 mb-6">
          <div className="text-gray-400 text-sm">Available Cash</div>
          <div className="text-3xl font-bold text-white">₹72,000</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">Deployment Capacity</span>
              <span className="text-white font-medium">60%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '60%' }}></div>
              <div className="bg-gray-600 h-full border-l border-gray-800" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div className="bg-success/10 border border-success/20 rounded p-3 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="text-success font-medium mb-1">Reserve Status Healthy</div>
              <div className="text-gray-300 text-xs">Available for 3 major market corrections based on current rules.</div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
