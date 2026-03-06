import React from 'react';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';
import PortalSwitcher from './PortalSwitcher';

interface TopBarProps {
  viewMode: 'patient' | 'staff';
  setViewMode: (mode: 'patient' | 'staff') => void;
  setActiveTab: (tab: string) => void;
  onMenuToggle: () => void;
}

export default function TopBar({ viewMode, setViewMode, setActiveTab, onMenuToggle }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, doctors, or records..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="hidden sm:block">
          <PortalSwitcher viewMode={viewMode} setViewMode={setViewMode} setActiveTab={setActiveTab} />
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">Dr. Adarsh Singh</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Chief Surgeon</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <User size={20} />
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
