import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  Zap, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Plane, 
  Users, 
  Award, 
  Activity, 
  ChevronDown, 
  Star,
  CheckCircle2,
  Calendar,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStartBooking: (type?: 'appointment' | 'ambulance' | 'air_ambulance') => void;
}

const faqs = [
  { q: "How do I book an emergency ambulance?", a: "You can book an ambulance directly through our portal by selecting the 'Ambulance' option. For immediate life-threatening emergencies, please call our 24/7 hotline at +1 (555) 000-1234." },
  { q: "What is an Air Ambulance?", a: "An Air Ambulance is a specially equipped aircraft for transporting patients over long distances or from remote areas where ground transport is not feasible. It includes a full medical team and life-support equipment." },
  { q: "Can I choose my preferred doctor?", a: "Yes, our booking system allows you to see available specialists and their schedules. You can select the doctor that best fits your needs during the appointment booking process." },
  { q: "Is my medical data secure?", a: "Absolutely. We use industry-standard encryption and follow strict HIPAA-compliant protocols to ensure your personal and medical information remains private and secure." }
];

export default function LandingPage({ onStartBooking }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <Heart size={14} />
              Your Health, Our Priority
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight text-responsive-h1">
              Modern Healthcare <br />
              <span className="text-indigo-600">Powered by AI.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Experience the future of hospital management. Book appointments, request emergency transport, and get AI-assisted medical guidance instantly.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <button 
                onClick={() => onStartBooking('appointment')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
              >
                Book an Appointment
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  servicesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Our Services
              </button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    className="w-10 h-10 rounded-full border-2 border-white"
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">2,000+</span> patients trusted us this month
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white aspect-[4/3]">
              <img 
                src="https://picsum.photos/seed/hospital-hero/800/600" 
                alt="Modern Hospital"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Emergency Response</p>
                <p className="text-lg font-bold text-slate-900">Under 15 Mins</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-responsive-h2">What do you need today?</h2>
            <p className="text-slate-600 text-base sm:text-lg">Select a service to get started with our AI-assisted booking system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                type: 'appointment' as const,
                title: 'Appointment', 
                desc: 'Regular checkups & consultations', 
                icon: Calendar, 
                color: 'text-indigo-600', 
                bg: 'bg-indigo-50',
                hover: 'hover:border-indigo-600 hover:bg-indigo-50'
              },
              { 
                type: 'ambulance' as const,
                title: 'Ambulance', 
                desc: 'Emergency ground transport', 
                icon: Truck, 
                color: 'text-rose-600', 
                bg: 'bg-rose-50',
                hover: 'hover:border-rose-600 hover:bg-rose-50'
              },
              { 
                type: 'air_ambulance' as const,
                title: 'Air Ambulance', 
                desc: 'Critical long-distance transport', 
                icon: Plane, 
                color: 'text-blue-600', 
                bg: 'bg-blue-50',
                hover: 'hover:border-blue-600 hover:bg-blue-50'
              },
            ].map((s, i) => (
              <motion.button 
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => onStartBooking(s.type)}
                className={`bg-white p-10 rounded-[32px] border-2 border-slate-100 shadow-sm transition-all text-left group ${s.hover}`}
              >
                <div className={`${s.bg} ${s.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <s.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{s.desc}</p>
                <div className={`mt-6 flex items-center gap-2 font-bold text-sm ${s.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Book Now <ArrowRight size={16} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Successful Surgeries', value: '15k+', icon: Activity },
              { label: 'Expert Doctors', value: '250+', icon: Users },
              { label: 'Years Experience', value: '25+', icon: Award },
              { label: 'Patient Satisfaction', value: '99%', icon: Heart },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex justify-center text-indigo-600 mb-2">
                  <stat.icon size={24} />
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-responsive-h2">Comprehensive Care Solutions</h2>
            <p className="text-slate-600 text-base sm:text-lg">We combine world-class medical expertise with cutting-edge technology to provide the best care possible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'AI Diagnostics', desc: 'Get instant specialist recommendations based on your symptoms using our advanced AI engine.', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { title: 'Air Ambulance', desc: 'Critical care transport available 24/7 for long-distance emergencies with full medical support.', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-100' },
              { title: 'Smart Scheduling', desc: 'Manage your health records and appointments through our secure, easy-to-use patient portal.', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`${f.bg} ${f.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left">
            <div className="max-w-xl space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-responsive-h2">Meet Our Specialists</h2>
              <p className="text-slate-600 text-base sm:text-lg">Our team of world-renowned doctors is dedicated to providing you with the highest quality of care.</p>
            </div>
            <button className="px-6 py-3 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2">
              View All Doctors <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Dr. Sarah Smith', role: 'Chief Cardiologist', img: 'doc1' },
              { name: 'Dr. Mike Ross', role: 'Senior Neurologist', img: 'doc2' },
              { name: 'Dr. Lisa Wong', role: 'Orthopedic Surgeon', img: 'doc3' },
              { name: 'Dr. James Wilson', role: 'Pediatric Specialist', img: 'doc4' },
            ].map((doc, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4">
                  <img 
                    src={`https://picsum.photos/seed/${doc.img}/400/500`} 
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                <p className="text-slate-500 font-medium">{doc.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-white rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-responsive-h2">What Our Patients Say</h2>
            <p className="text-indigo-100 text-base sm:text-lg">Real stories from real people who trusted us with their health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Robert Fox', text: "The AI symptom checker was incredibly accurate. It recommended a cardiologist who found a minor issue before it became major.", rating: 5 },
              { name: 'Jane Cooper', text: "The Air Ambulance service saved my father's life. The medical team was professional and the transport was seamless.", rating: 5 },
              { name: 'Cody Fisher', text: "Booking an appointment has never been easier. I love how I can manage everything from my phone.", rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-lg italic mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={`https://picsum.photos/seed/p${i}/100/100`} className="w-12 h-12 rounded-full border-2 border-white/50" alt={t.name} />
                  <span className="font-bold">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-responsive-h2">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-base sm:text-lg">Everything you need to know about our services and portal.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-all"
                >
                  <span className="font-bold text-slate-800">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight text-responsive-h1">
              Ready to take control <br /> of your health?
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
              Join thousands of patients who have already switched to our modern, AI-powered healthcare platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={onStartBooking}
                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-2xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
              >
                Get Started Now <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Contact Support
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-8">
              {['24/7 Support', 'Secure Data', 'Expert Doctors'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                  <CheckCircle2 size={16} className="text-indigo-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Heart size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">VitalCare</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>+1 (555) 000-1234</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>123 Medical Plaza, NY</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400">© 2024 VitalCare Hospital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
