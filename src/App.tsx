import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import DoctorList from './components/DoctorList';
import AppointmentManagement from './components/AppointmentManagement';
import ClientBooking from './components/ClientBooking';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import MedicalAI from './components/MedicalAI';
import BedManagement from './components/BedManagement';
import Pharmacy from './components/Pharmacy';
import Laboratory from './components/Laboratory';
import Billing from './components/Billing';
import PortalSwitcher from './components/PortalSwitcher';
import StaffLogin from './components/StaffLogin';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, UserCircle, Activity, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'patient' | 'staff'>('patient');
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialBookingType, setInitialBookingType] = useState<'appointment' | 'ambulance' | 'air_ambulance' | undefined>();

  const handleStaffLogin = () => {
    setIsStaffAuthenticated(true);
    setShowStaffLogin(false);
    setViewMode('staff');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsStaffAuthenticated(false);
    setViewMode('patient');
    setActiveTab('home');
  };

  const renderContent = () => {
    if (viewMode === 'patient') {
      switch (activeTab) {
        case 'home':
          return (
            <LandingPage 
              onStartBooking={(type) => { 
                setInitialBookingType(type);
                setActiveTab('booking'); 
              }} 
            />
          );
        case 'booking':
          return <ClientBooking initialType={initialBookingType} />;
        case 'history':
          return <div className="p-8">My Medical History (Coming Soon)</div>;
        default:
          return <LandingPage onStartBooking={() => setActiveTab('booking')} />;
      }
    }

    if (!isStaffAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Staff Authentication Required</h2>
          <p className="text-slate-500 max-w-md mb-8">This area is restricted to authorized hospital personnel. Please log in to continue.</p>
          <button 
            onClick={() => setShowStaffLogin(true)}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            Staff Login
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNewAdmission={() => setActiveTab('booking')} />;
      case 'patients':
        return <PatientList />;
      case 'doctors':
        return <DoctorList />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'beds':
        return <BedManagement />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'laboratory':
        return <Laboratory />;
      case 'billing':
        return <Billing />;
      case 'booking':
        return <ClientBooking />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AnimatePresence>
        {showStaffLogin && (
          <StaffLogin 
            onLogin={handleStaffLogin} 
            onCancel={() => setShowStaffLogin(false)} 
          />
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        {viewMode === 'staff' && isStaffAuthenticated && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onLogout={handleLogout}
          />
        )}
        
        <main className={`flex-1 flex flex-col ${viewMode === 'staff' && isStaffAuthenticated ? 'lg:ml-64' : ''}`}>
          {viewMode === 'staff' && (
            <TopBar 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              setActiveTab={setActiveTab} 
              onMenuToggle={() => setIsSidebarOpen(true)}
            />
          )}
          {viewMode === 'patient' && (
            <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg lg:text-xl">
                <Activity size={24} />
                <span className="hidden sm:inline">VitalCare Patient</span>
                <span className="sm:hidden">VitalCare</span>
              </div>
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="flex gap-3 lg:gap-6">
                  <button onClick={() => setActiveTab('home')} className={`text-xs lg:text-sm font-medium ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-500'}`}>Home</button>
                  <button onClick={() => setActiveTab('booking')} className={`text-xs lg:text-sm font-medium ${activeTab === 'booking' ? 'text-indigo-600' : 'text-slate-500'}`}>Book</button>
                  <button onClick={() => setActiveTab('history')} className={`text-xs lg:text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500'}`}>History</button>
                </div>
              </div>
            </div>
          )}
          
          <div className={`${viewMode === 'staff' && isStaffAuthenticated ? 'p-4 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {viewMode === 'patient' && (
            <footer className="mt-auto py-8 px-8 border-t border-slate-100 bg-white">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-slate-400 text-sm">
                  © 2026 VitalCare Hospital Systems. All rights reserved.
                </div>
                <button 
                  onClick={() => setShowStaffLogin(true)}
                  className="text-slate-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <ShieldCheck size={14} />
                  Staff Access
                </button>
              </div>
            </footer>
          )}
        </main>
      </div>

      <MedicalAI />
    </div>
  );
}
