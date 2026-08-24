import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  Settings as SettingsIcon, 
  Briefcase,
  History
} from 'lucide-react';
import { cn } from '../utils/cn';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Funds', path: '/funds', icon: Briefcase },
  { name: 'Deployment Center', path: '/deployment-center', icon: Wallet },
  { name: 'Deployment Journal', path: '/deployment-journal', icon: History },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-[#1F2937]">
        <h1 className="text-xl font-bold text-white tracking-tight">DipSIP <span className="text-[#6366F1]">AI</span></h1>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-[#1F2937] text-white'
                  : 'text-gray-400 hover:bg-[#1F2937]/50 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
