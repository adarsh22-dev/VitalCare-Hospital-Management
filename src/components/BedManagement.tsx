import React, { useState, useEffect } from 'react';
import { Bed, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function BedManagement() {
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/beds')
      .then(res => res.json())
      .then(data => {
        setBeds(data);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'Occupied': return <XCircle className="text-rose-500" size={18} />;
      case 'Cleaning': return <Clock className="text-amber-500" size={18} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bed Management</h1>
          <p className="text-slate-500">Monitor and manage hospital bed occupancy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beds.map((bed) => (
          <div key={bed.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Bed size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                bed.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                bed.status === 'Occupied' ? 'bg-rose-50 text-rose-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {getStatusIcon(bed.status)}
                {bed.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{bed.room_number}</h3>
            <p className="text-slate-500 text-sm">{bed.type} Ward</p>
            
            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Update Status
              </button>
              {bed.status === 'Occupied' && (
                <span className="text-xs text-slate-400">Patient ID: #{bed.patient_id}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
