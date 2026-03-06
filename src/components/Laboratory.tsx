import React, { useState, useEffect } from 'react';
import { Beaker, Search, Plus, FileText } from 'lucide-react';

export default function Laboratory() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lab-tests')
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laboratory Management</h1>
          <p className="text-slate-500">Track lab tests and diagnostic reports.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Plus size={18} />
          New Test
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.length > 0 ? tests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{test.patient_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{test.test_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      test.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                      test.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(test.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No lab tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
