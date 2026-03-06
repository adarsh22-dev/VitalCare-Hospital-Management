import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { Doctor } from '../types';

const availabilityColors = {
  Available: 'bg-emerald-100 text-emerald-700',
  'In Surgery': 'bg-rose-100 text-rose-700',
  'On Break': 'bg-orange-100 text-orange-700',
  Offline: 'bg-slate-100 text-slate-700',
};

export default function DoctorList() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: 'Cardiology', experience: '' });

  const fetchDoctors = () => {
    setLoading(true);
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor)
      });
      setIsAddModalOpen(false);
      setNewDoctor({ name: '', specialty: 'Cardiology', experience: '' });
      fetchDoctors();
    } catch (e) {
      alert('Failed to add doctor');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Specialist</h2>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newDoctor.name}
                  onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Specialty</label>
                <select 
                  value={newDoctor.specialty}
                  onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                >
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                  <option>Dermatology</option>
                  <option>General Medicine</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Experience (e.g. 10 years)</label>
                <input 
                  required
                  type="text" 
                  value={newDoctor.experience}
                  onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500/20"
                  placeholder="12 years"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Staff</h1>
          <p className="text-slate-500">Manage and view all hospital doctors and their status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          Add Doctor
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or specialty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <img 
                  src={doctor.image || `https://picsum.photos/seed/doc${doctor.id}/200/200`} 
                  alt={doctor.name} 
                  className="w-16 h-16 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  doctor.availability === 'Available' ? 'bg-emerald-500' : 
                  doctor.availability === 'In Surgery' ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-800 text-lg">{doctor.name}</h3>
            <p className="text-indigo-600 text-sm font-medium">{doctor.specialty}</p>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
              <div>
                <p className="font-bold text-slate-800">{doctor.experience || '10 years'}</p>
                <p className="text-xs">Experience</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-100" />
              <div>
                <p className="font-bold text-slate-800">{doctor.patients_count || doctor.patients || 0}</p>
                <p className="text-xs">Patients</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${availabilityColors[doctor.availability as keyof typeof availabilityColors] || availabilityColors.Offline}`}>
                {doctor.availability}
              </span>
              <button className="text-sm font-bold text-indigo-600 hover:underline">
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

