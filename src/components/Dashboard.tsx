import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Truck, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const chartData = [
  { name: 'Mon', patients: 40 },
  { name: 'Tue', patients: 30 },
  { name: 'Wed', patients: 60 },
  { name: 'Thu', patients: 45 },
  { name: 'Fri', patients: 70 },
  { name: 'Sat', patients: 25 },
  { name: 'Sun', patients: 35 },
];

export default function Dashboard({ onNewAdmission }: { onNewAdmission?: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes, chartRes] = await Promise.all([
          fetch('/api/stats').then(res => res.json()),
          fetch('/api/activities').then(res => res.json()),
          fetch('/api/chart-data').then(res => res.json())
        ]);
        setStats(statsRes);
        setActivities(activitiesRes);
        setChartData(chartRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Patients', value: stats?.totalPatients || '0', icon: Users, color: 'bg-blue-500', trend: '+12%', isUp: true },
    { label: 'Appointments', value: stats?.totalAppointments || '0', icon: Calendar, color: 'bg-indigo-500', trend: '+5%', isUp: true },
    { label: 'Available Doctors', value: stats?.availableDoctors || '0', icon: Stethoscope, color: 'bg-emerald-500', trend: 'Stable', isUp: true },
    { label: 'Emergency Dispatches', value: stats?.totalTransport || '0', icon: Truck, color: 'bg-rose-500', trend: 'Active', isUp: true },
  ];

  const bedStats = [
    { label: 'ICU Beds', available: 5, total: 10, color: 'bg-rose-500' },
    { label: 'General Ward', available: 24, total: 50, color: 'bg-blue-500' },
    { label: 'Private Rooms', available: 8, total: 15, color: 'bg-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Overview</h1>
          <p className="text-slate-500">Welcome back, Dr. Adarsh. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Download Report
          </button>
          <button 
            onClick={onNewAdmission}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            + New Admission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trend}
                {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Patient Admissions</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPatients)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Bed Availability</h3>
          <div className="space-y-6">
            {bedStats.map((bed, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{bed.label}</span>
                  <span className="text-slate-400">{bed.available} / {bed.total} Available</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(bed.available / bed.total) * 100}%` }}
                    className={`h-full ${bed.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Revenue Analytics</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-800">$42,850</span>
              <span className="text-emerald-500 text-sm font-medium mb-1">+8.2%</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Total revenue this month</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Recent System Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.length > 0 ? activities.map((activity, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.color}`} />
              <div>
                <p className="text-sm font-medium text-slate-800">{activity.user}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.action}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                  {activity.time}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-400 text-center py-8 col-span-full">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

