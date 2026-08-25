import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/Card';
import { Database, Wallet } from 'lucide-react';
import { useSettings } from '../hooks/useAnalytics';
import { useCashReserve } from '../hooks/useCashReserve';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure DipSIP AI parameters and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('rules')}
              className={`${activeTab === 'rules' ? 'bg-[#1F2937] text-white' : 'text-gray-400 hover:bg-[#1F2937]/50 hover:text-white'} flex items-center px-3 py-2 w-full text-sm font-medium rounded-md`}
            >
              <Wallet className="w-4 h-4 mr-3" />
              Deployment Rules
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`${activeTab === 'general' ? 'bg-[#1F2937] text-white' : 'text-gray-400 hover:bg-[#1F2937]/50 hover:text-white'} flex items-center px-3 py-2 w-full text-sm font-medium rounded-md`}
            >
              <Database className="w-4 h-4 mr-3" />
              Data Sync
            </button>
          </nav>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'rules' && <RulesSettings />}
          {activeTab === 'general' && <GeneralSettings />}
        </div>
      </div>
    </div>
  );
}

function RulesSettings() {
  const { data: thresholds, updateSettings, isUpdating: isUpdatingSettings } = useSettings();
  const { data: cash, updateCash, isUpdating: isUpdatingCash } = useCashReserve();

  const [form, setForm] = useState({
    watch: -5,
    buy1: -8,
    buy2: -15,
    buy3: -25,
    regime_correction: -5,
    regime_bear: -10,
    regime_panic: -20,
    total_cash: 0,
    emergency_reserve: 0,
  });

  useEffect(() => {
    if (thresholds) {
      setForm(f => ({ ...f, ...thresholds }));
    }
  }, [thresholds]);

  useEffect(() => {
    if (cash) {
      setForm(f => ({ ...f, total_cash: cash.total_cash, emergency_reserve: cash.emergency_reserve }));
    }
  }, [cash]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    updateSettings({
      watch: form.watch,
      buy1: form.buy1,
      buy2: form.buy2,
      buy3: form.buy3,
      regime_correction: form.regime_correction,
      regime_bear: form.regime_bear,
      regime_panic: form.regime_panic,
    });
    updateCash({
      total_cash: form.total_cash,
      emergency_reserve: form.emergency_reserve,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cash Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Cash Reserve (₹)</label>
              <input
                type="number"
                name="total_cash"
                value={form.total_cash}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Reserve (₹)</label>
              <input
                type="number"
                name="emergency_reserve"
                value={form.emergency_reserve}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fund Drawdown Thresholds (%)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Watch Tier</label>
              <input
                type="number"
                name="watch"
                value={form.watch}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Buy 1 Tier</label>
              <input
                type="number"
                name="buy1"
                value={form.buy1}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Buy 2 Tier</label>
              <input
                type="number"
                name="buy2"
                value={form.buy2}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Buy 3 Tier</label>
              <input
                type="number"
                name="buy3"
                value={form.buy3}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Regime Thresholds (%)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Correction</label>
              <input
                type="number"
                name="regime_correction"
                value={form.regime_correction}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bear</label>
              <input
                type="number"
                name="regime_bear"
                value={form.regime_bear}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Panic</label>
              <input
                type="number"
                name="regime_panic"
                value={form.regime_panic}
                onChange={handleChange}
                className="w-full bg-[#111827] border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isUpdatingSettings || isUpdatingCash}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isUpdatingSettings || isUpdatingCash ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
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
  );
}
