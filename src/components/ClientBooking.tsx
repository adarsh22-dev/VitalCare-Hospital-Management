import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, MessageSquare, AlertCircle, Plane, Truck } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { getAiInstance } from '../services/aiService';

interface ClientBookingProps {
  initialType?: 'appointment' | 'ambulance' | 'air_ambulance';
}

export default function ClientBooking({ initialType }: ClientBookingProps) {
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    type: 'Consultation',
    symptoms: '',
    date: '',
    time: '',
    doctor_id: '',
    priority: 'Normal'
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<'appointment' | 'ambulance' | 'air_ambulance'>(initialType || 'appointment');

  useEffect(() => {
    fetch('/api/doctors').then(res => res.json()).then(setDoctors);
  }, []);

  const getAiHelp = async () => {
    if (!formData.symptoms) return;
    setIsAiLoading(true);
    try {
      if (!process.env.GEMINI_API_KEY) {
        setAiSuggestion("AI analysis is unavailable (API key missing).");
        setIsAiLoading(false);
        return;
      }
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these symptoms: "${formData.symptoms}", which type of specialist should this patient see? Options: Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology. Also suggest if this sounds like an emergency. Keep it brief.`,
      });
      setAiSuggestion(response.text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (bookingType === 'appointment') {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: bookingType === 'ambulance' ? 'Ambulance' : 'Air Ambulance',
            patient_name: formData.patient_name,
            location: formData.symptoms // Using symptoms field as location for transport
          })
        });
      }
      setStep(3);
    } catch (e) {
      alert('Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-3xl font-bold">VitalCare Booking</h2>
          <p className="text-indigo-100 mt-2">Fast, AI-assisted medical services at your fingertips.</p>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">What do you need today?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => { setBookingType('appointment'); setStep(2); }}
                  className="p-6 border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group"
                >
                  <Calendar className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                  <p className="font-bold text-slate-800">Appointment</p>
                  <p className="text-xs text-slate-500 mt-1">Regular checkups & consultations</p>
                </button>
                <button 
                  onClick={() => { setBookingType('ambulance'); setStep(2); }}
                  className="p-6 border-2 border-slate-100 rounded-2xl hover:border-rose-600 hover:bg-rose-50 transition-all text-left group"
                >
                  <Truck className="text-rose-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                  <p className="font-bold text-slate-800">Ambulance</p>
                  <p className="text-xs text-slate-500 mt-1">Emergency ground transport</p>
                </button>
                <button 
                  onClick={() => { setBookingType('air_ambulance'); setStep(2); }}
                  className="p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
                >
                  <Plane className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                  <p className="font-bold text-slate-800">Air Ambulance</p>
                  <p className="text-xs text-slate-500 mt-1">Critical long-distance transport</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.patient_name}
                      onChange={e => setFormData({...formData, patient_name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="email" 
                      value={formData.patient_email}
                      onChange={e => setFormData({...formData, patient_email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {bookingType === 'appointment' ? 'Describe Symptoms' : 'Pickup Location & Details'}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    required
                    rows={3}
                    value={formData.symptoms}
                    onChange={e => setFormData({...formData, symptoms: e.target.value})}
                    onBlur={bookingType === 'appointment' ? getAiHelp : undefined}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    placeholder={bookingType === 'appointment' ? "Tell us how you feel..." : "Enter full address..."}
                  />
                </div>
                {isAiLoading && <p className="text-xs text-indigo-600 animate-pulse">AI is analyzing your symptoms...</p>}
                {aiSuggestion && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                    <AlertCircle className="text-indigo-600 shrink-0" size={18} />
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      <span className="font-bold">AI Suggestion:</span> {aiSuggestion}
                    </p>
                  </div>
                )}
              </div>

              {bookingType === 'appointment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Preferred Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Preferred Time</label>
                    <input 
                      required
                      type="time" 
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Calendar size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h3>
                <p className="text-slate-500 mt-2">
                  {bookingType === 'appointment' 
                    ? "Your appointment has been scheduled. We'll send you a confirmation email shortly."
                    : "Emergency services have been dispatched to your location. Please stay on the line."}
                </p>
              </div>
              <button 
                onClick={() => { setStep(1); setFormData({ patient_name: '', patient_email: '', type: 'Consultation', symptoms: '', date: '', time: '', doctor_id: '', priority: 'Normal' }); setAiSuggestion(''); }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Make Another Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
