import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  Settings, 
  LogOut, 
  Activity,
  Stethoscope,
  ClipboardList,
  Bed,
  Pill,
  Beaker,
  CreditCard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PortalSwitcher from './PortalSwitcher';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'patient' | 'staff';
  setViewMode: (mode: 'patient' | 'staff') => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Management', icon: Calendar },
  { id: 'beds', label: 'Beds', icon: Bed },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'laboratory', label: 'Laboratory', icon: Beaker },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'booking', label: 'Client Booking', icon: ClipboardList },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, viewMode, setViewMode, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div className={cn(
        "w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">VitalCare</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
            <LogOut size={20} className="rotate-180" />
          </button>
        </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-indigo-50 text-indigo-600 font-medium" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <item.icon size={20} className={cn(
              activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className="lg:hidden px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Switch Portal</p>
          <PortalSwitcher viewMode={viewMode} setViewMode={setViewMode} setActiveTab={setActiveTab} />
        </div>

        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === 'settings' 
                ? "bg-indigo-50 text-indigo-600 font-medium" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Settings size={20} className={cn(
              activeTab === 'settings' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
            )} />
            <span>Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </>
);
}
