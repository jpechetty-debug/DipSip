import { Card, CardContent } from '../components/shared/Card';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DeploymentJournal() {
  
  // Mock data for the journal
  const journalEntries = [
    { id: 'DEP-104', date: '2026-08-14', fund: 'Bandhan Small Cap', amount: 5000, trigger: 'BUY1', outcome: 11.2, status: 'completed' },
    { id: 'DEP-103', date: '2026-07-02', fund: 'Edelweiss Midcap', amount: 10000, trigger: 'BUY2', outcome: 4.5, status: 'completed' },
    { id: 'DEP-102', date: '2026-06-18', fund: 'PPFAS', amount: 8000, trigger: 'BUY1', outcome: -1.2, status: 'completed' },
    { id: 'DEP-101', date: '2026-05-10', fund: 'Bandhan Small Cap', amount: 5000, trigger: 'BUY1', outcome: 22.4, status: 'completed' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deployment Journal</h1>
          <p className="text-gray-400 text-sm mt-1">History of all rule-based capital deployments</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search fund..." 
              className="bg-[#1F2937] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64"
            />
          </div>
          <button className="bg-[#1F2937] border border-border px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#1F2937]/30 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-medium">ID / Date</th>
                  <th className="p-4 font-medium">Fund</th>
                  <th className="p-4 font-medium">Trigger</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {journalEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#1F2937]/20 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-medium text-white">{entry.id}</div>
                      <div className="text-xs text-gray-500">{entry.date}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-200">{entry.fund}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {entry.trigger}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-semibold text-white">₹{entry.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`text-sm font-semibold flex items-center justify-end ${entry.outcome > 0 ? 'text-success' : 'text-danger'}`}>
                        {entry.outcome > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {Math.abs(entry.outcome)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
