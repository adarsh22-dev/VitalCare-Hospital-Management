import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Plus, Download, CheckCircle2, XCircle } from 'lucide-react';

export default function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(data => {
        setBills(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Finance</h1>
          <p className="text-slate-500">Manage invoices, payments, and financial reports.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Plus size={18} />
          Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length > 0 ? bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{bill.patient_name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">${bill.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{bill.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                      bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                      bill.status === 'Unpaid' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {bill.status === 'Paid' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(bill.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No billing records found.
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
