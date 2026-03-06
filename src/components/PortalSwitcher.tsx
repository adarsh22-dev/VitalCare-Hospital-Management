import React from 'react';
import { LayoutDashboard, UserCircle } from 'lucide-react';

interface PortalSwitcherProps {
  viewMode: 'patient' | 'staff';
  setViewMode: (mode: 'patient' | 'staff') => void;
  setActiveTab: (tab: string) => void;
}

export default function PortalSwitcher({ viewMode, setViewMode, setActiveTab }: PortalSwitcherProps) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
      <button 
        onClick={() => { setViewMode('patient'); setActiveTab('home'); }}
        className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === 'patient' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <UserCircle size={12} />
        Patient
      </button>
      <button 
        onClick={() => { setViewMode('staff'); setActiveTab('dashboard'); }}
        className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === 'staff' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <LayoutDashboard size={12} />
        Staff
      </button>
    </div>
  );
}
