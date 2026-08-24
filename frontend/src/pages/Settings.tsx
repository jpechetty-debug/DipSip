import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Database, Bell, Shield, Wallet } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure DipSIP AI parameters and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <a href="#" className="bg-[#1F2937] text-white flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Database className="w-4 h-4 mr-3" />
              General
            </a>
            <a href="#" className="text-gray-400 hover:bg-[#1F2937]/50 hover:text-white flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Wallet className="w-4 h-4 mr-3" />
              Deployment Rules
            </a>
            <a href="#" className="text-gray-400 hover:bg-[#1F2937]/50 hover:text-white flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Bell className="w-4 h-4 mr-3" />
              Notifications
            </a>
            <a href="#" className="text-gray-400 hover:bg-[#1F2937]/50 hover:text-white flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <Shield className="w-4 h-4 mr-3" />
              API & Security
            </a>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <div className="font-medium text-white">Auto-Sync NAV</div>
                  <div className="text-sm text-gray-400">Fetch latest NAV data from AMFI daily at 11:00 PM</div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: 0, borderColor: '#6366F1', backgroundColor: '#6366F1' }} />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-[#1F2937] cursor-pointer"></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-white">Database Backup</div>
                  <div className="text-sm text-gray-400">Last backup: Today at 02:00 AM</div>
                </div>
                <button className="bg-secondary text-white px-3 py-1.5 rounded text-sm hover:bg-secondary/80 transition-colors">
                  Backup Now
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-danger">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Reset System State</div>
                  <div className="text-sm text-gray-400">Clear all deployment history and configurations. This cannot be undone.</div>
                </div>
                <button className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 px-3 py-1.5 rounded text-sm transition-colors">
                  Factory Reset
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
