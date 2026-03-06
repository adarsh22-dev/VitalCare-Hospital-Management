import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Stethoscope,
  Truck,
  Plane,
  MoreVertical,
  Sparkles,
  Loader2,
  Activity,
  Database
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { getAiInstance } from '../services/aiService';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transport, setTransport] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [suggestingId, setSuggestingId] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, number>>({});
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [vitalAssistData, setVitalAssistData] = useState<any | null>(null);
  const [isVitalAssisting, setIsVitalAssisting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'ai', text: 'Hello! I am VitalAssist, your hospital administrative AI. How can I help you manage the facility today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const fetchData = async () => {
    const [appts, trans, docs] = await Promise.all([
      fetch('/api/appointments').then(res => res.json()),
      fetch('/api/transport').then(res => res.json()),
      fetch('/api/doctors').then(res => res.json())
    ]);
    setAppointments(appts);
    setTransport(trans);
    setDoctors(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateAppointment = async (id: number, updates: any) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchData();
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
    await fetch(`/api/appointments/${id}`, {
      method: 'DELETE'
    });
    fetchData();
  };

  const getAiDoctorSuggestion = async (appointment: any) => {
    setSuggestingId(appointment.id);
    try {
      if (!process.env.GEMINI_API_KEY) {
        alert("AI features are unavailable (API key missing).");
        return;
      }
      const ai = getAiInstance();
      // Calculate workload (count appointments per doctor)
      const workloadMap: any = {};
      appointments.forEach(a => {
        if (a.doctor_id) {
          workloadMap[a.doctor_id] = (workloadMap[a.doctor_id] || 0) + 1;
        }
      });

      const doctorsContext = doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        currentWorkload: workloadMap[d.id] || 0
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Patient Symptoms: "${appointment.symptoms}". 
        Available Doctors: ${JSON.stringify(doctorsContext)}.
        Based on the symptoms and doctors' specialties and workload (prefer specialists first, then lower workload), suggest the best doctor ID from the list. 
        Return ONLY the doctor ID as a number.`,
      });

      const suggestedId = parseInt(response.text?.trim() || '');
      if (!isNaN(suggestedId) && doctors.find(d => d.id === suggestedId)) {
        setSuggestions(prev => ({ ...prev, [appointment.id]: suggestedId }));
      } else {
        alert("AI could not determine a clear suggestion. Please assign manually.");
      }
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      alert("Failed to get AI suggestion.");
    } finally {
      setSuggestingId(null);
    }
  };

  const runVitalAssist = async (appointment: any) => {
    setIsVitalAssisting(true);
    try {
      if (!process.env.GEMINI_API_KEY) {
        alert("VitalAssist AI is unavailable (API key missing).");
        return;
      }
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this patient case for a hospital management system:
        Patient: ${appointment.patient_name}
        Symptoms: "${appointment.symptoms}"
        Current Priority: ${appointment.priority}
        
        Provide a concise analysis in JSON format with:
        1. "triage": A 1-sentence medical summary.
        2. "recommendedPriority": "Emergency", "Urgent", "Normal", or "Routine".
        3. "suggestedSpecialty": The medical specialty needed.
        4. "immediateActions": A list of 2-3 immediate steps for the staff.
        5. "riskLevel": "High", "Medium", or "Low".`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setVitalAssistData({ ...result, patientName: appointment.patient_name, appointmentId: appointment.id });
    } catch (error) {
      console.error("VitalAssist Error:", error);
      alert("VitalAssist AI is currently unavailable.");
    } finally {
      setIsVitalAssisting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      if (!process.env.GEMINI_API_KEY) {
        setChatMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I can't help right now because the Gemini API key is not configured." }]);
        setIsTyping(false);
        return;
      }
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are VitalAssist, a hospital administrative AI. 
        Context: You are helping manage appointments, doctors, and patient flow.
        Current Appointments: ${JSON.stringify(appointments.map(a => ({ id: a.id, patient: a.patient_name, status: a.status, priority: a.priority })))}
        User Query: ${chatInput}`,
      });

      const aiMsg = { role: 'ai', text: response.text || "I'm sorry, I couldn't process that request." };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredAppointments = appointments
    .filter(a => filterPriority === 'All' || a.priority === filterPriority)
    .filter(a => {
      if (filterSpecialty === 'All') return true;
      const doctor = doctors.find(d => d.id === a.doctor_id);
      return doctor?.specialty === filterSpecialty;
    })
    .filter(a => 
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.symptoms.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(a => !showConflictsOnly || checkConflict(a))
    .sort((a, b) => {
      const priorityMap: any = { 'Emergency': 3, 'Urgent': 2, 'Normal': 1, 'Routine': 0 };
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading management console...</div>;

  const patientHistory = selectedPatient ? appointments.filter(a => a.patient_email === selectedPatient.patient_email && a.id !== selectedPatient.id) : [];
  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    emergency: appointments.filter(a => a.priority === 'Emergency').length
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Patient', 'Email', 'Date', 'Time', 'Priority', 'Status', 'Symptoms'];
    const rows = filteredAppointments.map(a => [
      a.id, a.patient_name, a.patient_email, a.date, a.time, a.priority, a.status, `"${a.symptoms.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkConflict = (a: any) => {
    if (a.status === 'Cancelled' || a.status === 'Completed') return null;
    const conflicts = appointments.filter(other => 
      other.id !== a.id && 
      other.date === a.date && 
      other.time === a.time && 
      other.status !== 'Cancelled' &&
      other.status !== 'Completed' &&
      (
        (a.doctor_id && other.doctor_id === a.doctor_id) || 
        (other.patient_email === a.patient_email)
      )
    );
    return conflicts.length > 0 ? conflicts : null;
  };

  return (
    <div className="space-y-8 relative pb-20">
      {/* Floating VitalAssist AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        {isChatOpen ? (
          <div className="w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-indigo-200" />
                <h3 className="font-bold text-sm">VitalAssist AI</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-white/10 rounded transition-colors">
                  <Activity size={16} />
                </button>
                <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'ai' 
                      ? 'bg-white text-slate-700 shadow-sm border border-slate-100' 
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask anything..."
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  <Activity size={16} className="rotate-90" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-3">
                AI can make mistakes. Verify important info.
              </p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="group flex items-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-sm">VitalAssist AI</span>
          </button>
        )}
      </div>

      {/* VitalAssist AI Modal */}
      {vitalAssistData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setVitalAssistData(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">VitalAssist AI Analysis</h2>
                  <p className="text-indigo-100 text-xs">Case review for {vitalAssistData.patientName}</p>
                </div>
              </div>
              <button onClick={() => setVitalAssistData(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    vitalAssistData.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' :
                    vitalAssistData.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {vitalAssistData.riskLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specialty:</span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase">
                    {vitalAssistData.suggestedSpecialty}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{vitalAssistData.triage}"
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Immediate Actions
                </h3>
                <ul className="space-y-2">
                  {vitalAssistData.immediateActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => {
                    updateAppointment(vitalAssistData.appointmentId, { priority: vitalAssistData.recommendedPriority });
                    setVitalAssistData(null);
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Apply Priority: {vitalAssistData.recommendedPriority}
                </button>
                <button 
                  onClick={() => setVitalAssistData(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Sidebar/Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Patient Record</h2>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {selectedPatient.patient_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedPatient.patient_name}</p>
                    <p className="text-sm text-slate-500">{selectedPatient.patient_email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Current Case</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      selectedPatient.priority === 'Emergency' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {selectedPatient.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 italic">
                    "{selectedPatient.symptoms}"
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={14} />
                  Medical History
                </h3>
                <div className="space-y-3">
                  {patientHistory.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No previous records found for this patient.</p>
                  ) : (
                    patientHistory.map(h => (
                      <div key={h.id} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-500">{h.date}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{h.status}</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium mb-1">{h.type} Appointment</p>
                        <p className="text-xs text-slate-500 line-clamp-2 italic">"{h.symptoms}"</p>
                        {h.doctor_name && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600 font-bold">
                            <Stethoscope size={10} />
                            Treated by {h.doctor_name}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operational Command</h1>
          <p className="text-slate-500">Manage appointments, emergency dispatches, and staff assignments.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: stats.total, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Pending Review', value: stats.pending, color: 'bg-orange-50 text-orange-600' },
          { label: 'Confirmed Today', value: stats.confirmed, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Emergency Cases', value: stats.emergency, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-3xl border border-white/50 shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Conflict Alert Banner */}
      {appointments.some(a => checkConflict(a)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Scheduling Conflicts Detected</p>
              <p className="text-amber-700 text-xs">Multiple appointments are scheduled for the same time with the same doctor or patient.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowConflictsOnly(!showConflictsOnly);
              setFilterPriority('All');
              setFilterSpecialty('All');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm ${
              showConflictsOnly 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {showConflictsOnly ? 'Show All Appointments' : 'Filter Conflicts Only'}
          </button>
        </div>
      )}

      {/* Global Quick Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={async () => {
              const unassigned = appointments.filter(a => !a.doctor_id && a.status === 'Pending');
              if (unassigned.length === 0) return alert("No unassigned pending appointments found.");
              if (confirm(`Trigger AI suggestions for ${unassigned.length} unassigned appointments?`)) {
                for (const appt of unassigned) {
                  await getAiDoctorSuggestion(appt);
                }
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm group"
          >
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
            Auto-Assign All (AI)
          </button>
          <button 
            onClick={async () => {
              const pending = appointments.filter(a => a.status === 'Pending');
              if (pending.length === 0) return alert("No pending appointments found.");
              if (confirm(`Confirm all ${pending.length} pending appointments?`)) {
                await Promise.all(pending.map(a => updateAppointment(a.id, { status: 'Confirmed' })));
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
          >
            <CheckCircle size={14} />
            Batch Confirm
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <input 
              type="text"
              placeholder="Search patient, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-indigo-500/20 shadow-sm"
            />
            <User size={14} className="absolute right-3 top-2.5 text-slate-400" />
          </div>
          <button 
            onClick={exportToCsv}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
          >
            <Database size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Emergency Transport Section */}
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="text-rose-600" size={24} />
          <h2 className="text-lg font-bold text-rose-900">Active Emergency Dispatches</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transport.length === 0 ? (
            <p className="text-rose-600/60 text-sm italic">No active dispatches</p>
          ) : transport.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex gap-4">
              <div className={`p-3 rounded-xl ${t.type === 'Air Ambulance' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                {t.type === 'Air Ambulance' ? <Plane size={20} /> : <Truck size={20} />}
              </div>
              <div>
                <p className="font-bold text-slate-800">{t.patient_name}</p>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{t.location}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-bold text-slate-800">Appointment Queue</h2>
            <p className="text-[10px] text-slate-400 md:hidden mt-1">Scroll right to see more details →</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Priority:</span>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="text-xs border-slate-200 rounded-lg bg-slate-50 focus:ring-indigo-500/20 py-1"
                >
                  <option value="All">All Priorities</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Specialty:</span>
                <select 
                  value={filterSpecialty} 
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="text-xs border-slate-200 rounded-lg bg-slate-50 focus:ring-indigo-500/20 py-1"
                >
                  <option value="All">All Specialties</option>
                  {specialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Total: {filteredAppointments.length}</span>
            {showConflictsOnly && (
              <button 
                onClick={() => setShowConflictsOnly(false)}
                className="text-[10px] text-rose-600 font-bold hover:underline"
              >
                Clear Conflict Filter
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Symptoms / Case</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Quick Actions</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map(a => (
                <tr key={a.id} id={`appt-${a.id}`} className={`hover:bg-slate-50/50 transition-all ${checkConflict(a) ? 'bg-rose-50 border-l-8 border-rose-500 shadow-md relative z-10' : ''}`}>
                  <td className="px-6 py-4 cursor-pointer group" onClick={() => setSelectedPatient(a)}>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{a.patient_name}</p>
                    <p className="text-xs text-slate-400">{a.patient_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-sm">{a.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs">{a.time}</span>
                      {checkConflict(a) && (
                        <div className="group relative">
                          <AlertTriangle size={14} className="text-rose-500 animate-pulse cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl z-50">
                            <p className="font-bold mb-1">Schedule Conflict Detected!</p>
                            <p className="opacity-80">This {checkConflict(a)?.[0].doctor_id === a.doctor_id ? 'doctor' : 'patient'} already has an appointment at this time.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 line-clamp-1 max-w-[200px]">{a.symptoms}</p>
                    <div className="mt-2">
                      <input 
                        type="text"
                        placeholder="Add internal note..."
                        defaultValue={a.internal_notes || ''}
                        onBlur={(e) => updateAppointment(a.id, { internal_notes: e.target.value })}
                        className="w-full bg-transparent border-b border-slate-100 text-[10px] text-slate-400 focus:border-indigo-300 focus:text-slate-600 transition-all outline-none py-1"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={a.priority} 
                      onChange={(e) => updateAppointment(a.id, { priority: e.target.value })}
                      className={`text-[10px] font-bold px-2 py-1 rounded uppercase border-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                        a.priority === 'Emergency' ? 'bg-rose-100 text-rose-600' : 
                        a.priority === 'Urgent' ? 'bg-orange-100 text-orange-600' : 
                        a.priority === 'Routine' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Normal">Normal</option>
                      <option value="Routine">Routine</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <select 
                          value={suggestions[a.id] || a.doctor_id || ''} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (suggestions[a.id]) {
                              setSuggestions(prev => {
                                const next = { ...prev };
                                delete next[a.id];
                                return next;
                              });
                            }
                            updateAppointment(a.id, { doctor_id: val });
                          }}
                          className={`text-sm rounded-lg focus:ring-indigo-500/20 transition-all ${
                            suggestions[a.id] 
                              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 font-medium text-indigo-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="">Unassigned</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.specialty}) {suggestions[a.id] === d.id ? '✨' : ''}
                            </option>
                          ))}
                        </select>
                        {a.status === 'Pending' && (
                          <button 
                            onClick={() => getAiDoctorSuggestion(a)}
                            disabled={suggestingId === a.id}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="AI Suggest Doctor"
                          >
                            {suggestingId === a.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          </button>
                        )}
                      </div>
                      {suggestions[a.id] && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                            <Sparkles size={10} />
                            AI Suggestion
                          </span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                updateAppointment(a.id, { doctor_id: suggestions[a.id] });
                                setSuggestions(prev => {
                                  const next = { ...prev };
                                  delete next[a.id];
                                  return next;
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded hover:bg-emerald-700 transition-colors font-bold shadow-sm"
                            >
                              <CheckCircle size={10} />
                              Confirm
                            </button>
                            <button 
                              onClick={() => {
                                setSuggestions(prev => {
                                  const next = { ...prev };
                                  delete next[a.id];
                                  return next;
                                });
                              }}
                              className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded hover:bg-slate-300 transition-colors font-bold"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      a.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {a.status}
                    </span>
                    {checkConflict(a) && (
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold uppercase animate-pulse">
                          Conflict
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap max-w-[120px]">
                      {checkConflict(a) ? (
                        <button 
                          onClick={() => getAiDoctorSuggestion(a)}
                          className="px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-bold uppercase animate-bounce shadow-sm"
                          title="Resolve Conflict with AI"
                        >
                          Resolve
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => updateAppointment(a.id, { priority: 'Emergency' })}
                            className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 text-[9px] font-bold uppercase"
                            title="Mark as Emergency"
                          >
                            SOS
                          </button>
                          <button 
                            onClick={() => runVitalAssist(a)}
                            disabled={isVitalAssisting}
                            className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 text-[9px] font-bold uppercase flex items-center gap-1"
                            title="VitalAssist AI Analysis"
                          >
                            {isVitalAssisting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            AI
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => alert(`Reminder sent to ${a.patient_email}`)}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 text-[9px] font-bold uppercase"
                        title="Send SMS/Email Reminder"
                      >
                        Remind
                      </button>
                      {a.status !== 'Completed' && (
                        <button 
                          onClick={() => updateAppointment(a.id, { status: 'Completed' })}
                          className="px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 text-[9px] font-bold uppercase"
                          title="Complete"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {a.status === 'Pending' && (
                        <button 
                          onClick={() => updateAppointment(a.id, { status: 'Confirmed' })}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Confirm"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => updateAppointment(a.id, { status: 'Cancelled' })}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Cancel"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => deleteAppointment(a.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Permanently"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
