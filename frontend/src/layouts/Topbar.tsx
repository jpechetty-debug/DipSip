import { Bell, RefreshCw } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 bg-[#111827] border-b border-[#1F2937] flex items-center justify-between px-6">
      <div className="flex items-center space-x-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Portfolio Value</span>
          <span className="text-lg font-semibold text-white">₹--</span>
        </div>
        <div className="h-8 w-px bg-[#1F2937]"></div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cash Ready</span>
          <span className="text-lg font-semibold text-white">₹--</span>
        </div>
        <div className="h-8 w-px bg-[#1F2937]"></div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Regime:</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F59E0B]/20 text-[#F59E0B]">--</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync NAV
        </button>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-[#1F2937]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-[#111827]"></span>
        </button>
      </div>
    </header>
  );
}
