import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface StaffLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export default function StaffLogin({ onLogin, onCancel }: StaffLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo PIN
    if (pin === '1234') {
      onLogin();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Staff Access Only</h2>
          <p className="text-slate-500 mb-8">Please enter your 4-digit security PIN to access the management portal.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className={`w-full text-center text-3xl tracking-[1em] py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                  error ? 'border-rose-500 bg-rose-50' : 'border-slate-100 focus:border-indigo-500 focus:bg-white'
                }`}
                autoFocus
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-sm font-bold mt-2"
                >
                  Invalid Security PIN
                </motion.p>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Access Portal
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Activity size={14} />
            <span>VitalCare Secure Systems</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
