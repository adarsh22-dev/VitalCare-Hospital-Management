import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Hospital,
  Save,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export default function Settings() {
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    hospitalName: 'VitalCare Medical Center',
    adminEmail: 'admin@vitalcare.com',
    timezone: 'Pacific Standard Time (PST)',
    autoTriage: true,
    conflictDetection: true,
    smartMatching: false,
    notifications: true,
    securityLevel: 'High'
  });

  useEffect(() => {
    const saved = localStorage.getItem('vitalcare_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('vitalcare_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaults = {
        hospitalName: 'VitalCare Medical Center',
        adminEmail: 'admin@vitalcare.com',
        timezone: 'Pacific Standard Time (PST)',
        autoTriage: true,
        conflictDetection: true,
        smartMatching: false,
        notifications: true,
        securityLevel: 'High'
      };
      setSettings(defaults);
      localStorage.setItem('vitalcare_settings', JSON.stringify(defaults));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-slate-500">Configure hospital parameters and AI behavior.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'General', icon: Hospital },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'ai', label: 'AI Configuration', icon: Globe },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-white shadow-sm text-indigo-600 font-bold border border-slate-100' 
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Hospital Information</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hospital Name</label>
                    <input 
                      type="text" 
                      value={settings.hospitalName}
                      onChange={(e) => setSettings({...settings, hospitalName: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facility ID</label>
                    <input 
                      type="text" 
                      defaultValue="VC-8829-X"
                      disabled
                      className="w-full bg-slate-100 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Contact Email</label>
                  <input 
                    type="email" 
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timezone</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                  >
                    <option>Pacific Standard Time (PST)</option>
                    <option>Eastern Standard Time (EST)</option>
                    <option>Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">AI & Automation</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">VitalAssist Auto-Triage</p>
                    <p className="text-xs text-slate-500">Automatically analyze symptoms for new bookings.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, autoTriage: !settings.autoTriage})}
                    className={`w-12 h-6 rounded-full relative transition-all ${settings.autoTriage ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.autoTriage ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Conflict Auto-Detection</p>
                    <p className="text-xs text-slate-500">Real-time monitoring of scheduling overlaps.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, conflictDetection: !settings.conflictDetection})}
                    className={`w-12 h-6 rounded-full relative transition-all ${settings.conflictDetection ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.conflictDetection ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Smart Doctor Matching</p>
                    <p className="text-xs text-slate-500">AI-driven workload balancing for staff assignments.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, smartMatching: !settings.smartMatching})}
                    className={`w-12 h-6 rounded-full relative transition-all ${settings.smartMatching ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.smartMatching ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'ai' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
              <SettingsIcon size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Section Under Development</h3>
              <p className="text-sm text-slate-500">The {activeTab} settings are being migrated to the new AI core.</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {isSaved ? 'Settings Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

