
import React, { useState } from 'react';
import { Screen, Doctor } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const TOP_SPECIALISTS: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', hospital: 'Apollo Hospital', rating: 4.9, image: 'https://picsum.photos/seed/doc1/200/200' },
  { id: '2', name: 'Dr. Aman Gupta', specialty: 'General Physician', hospital: 'Yashoda Hospital', rating: 4.7, image: 'https://picsum.photos/seed/doc2/200/200' },
  { id: '3', name: 'Dr. Emily Chen', specialty: 'Neurologist', hospital: 'Care Hospital', rating: 4.8, image: 'https://picsum.photos/seed/doc3/200/200' },
];

const LOCATIONS = [
  'Hyderabad, TG',
  'Bangalore, KA',
  'Mumbai, MH',
  'Delhi, DL',
  'Chennai, TN'
];

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 pt-10 pb-32 min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex flex-col gap-4 relative z-[100]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(Screen.PROFILE)}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <span className="material-icons-round text-primary text-2xl">person</span>
            </button>
            <div className="flex flex-col relative">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Your Location</span>
              <button 
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-sm focus:outline-none group"
              >
                <span className="material-icons-round text-primary text-sm">location_on</span>
                {selectedLocation}
                <span className={`material-icons-round text-gray-400 text-sm transition-transform duration-300 ${isLocationMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {/* Location Dropdown */}
              {isLocationMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsLocationMenuOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 py-3 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 mb-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select City</p>
                    </div>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${selectedLocation === loc ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                      >
                        <span className="text-xs font-bold">{loc}</span>
                        {selectedLocation === loc && <span className="material-icons-round text-sm">check_circle</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 active:scale-95 transition-all">
              <span className="material-icons-outlined text-xl">favorite_border</span>
            </button>
            <button className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-gray-500 dark:text-gray-400 relative border border-gray-100 dark:border-gray-700 active:scale-95 transition-all">
              <span className="material-icons-outlined text-xl">notifications_none</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
          </div>
        </div>

        <div className="relative group z-0">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">search</span>
          <input 
            type="text" 
            placeholder="Doctors, Hospitals, Medicines..." 
            className="w-full bg-white dark:bg-gray-800 border-none rounded-[1.5rem] py-4 pl-12 pr-12 text-sm shadow-sm focus:ring-2 focus:ring-primary transition-all dark:text-white"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-primary">
            <span className="material-icons-round text-lg">tune</span>
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-6 mt-4 relative z-0">
        <div className="relative w-full h-44 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer transition-transform active:scale-[0.98]">
          <img 
            alt="Healthcare Offer" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/95 via-cyan-600/70 to-transparent p-8 flex flex-col justify-center text-white">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] w-fit mb-3 border border-white/30">Hospitonet Exclusive</span>
            <h2 className="text-2xl font-black leading-tight mb-1">Full Body Checkup</h2>
            <p className="text-white/80 text-xs mb-4 font-bold">Get 25% OFF on your first booking</p>
            <button className="bg-white text-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit shadow-lg transition-all active:translate-y-0.5">
              Book Today
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="px-6 mt-6">
        <div 
          onClick={() => onNavigate(Screen.ASSISTANT)}
          className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-[2rem] p-5 flex items-center justify-between text-white shadow-2xl shadow-black/10 cursor-pointer active:scale-[0.98] transition-all border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="material-icons-round text-2xl">bolt</span>
            </div>
            <div>
              <h4 className="font-black text-sm tracking-tight text-cyan-400">Hospitonet AI</h4>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Powered by Gemini 3</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest">Ask Now</span>
            <span className="material-icons-round text-sm text-cyan-500">chevron_right</span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Essential Services</h3>
          <button className="text-xs font-bold text-primary hover:underline">See All</button>
        </div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-8">
          {[
            { id: Screen.MEDICINES, label: 'Medicine', icon: 'local_pharmacy' },
            { id: Screen.HOSPITALS, label: 'Appointment', icon: 'calendar_month' },
            { id: Screen.RECORDS, label: 'Lab Tests', icon: 'science' },
            { id: Screen.RECORDS, label: 'Records', icon: 'description' },
            { id: Screen.HOME, label: 'Consult', icon: 'videocam' },
            { id: Screen.HOSPITALS, label: 'Hospitals', icon: 'medical_services' },
            { id: Screen.HOSPITALS, label: 'Emergency', icon: 'emergency' },
            { id: Screen.HOME, label: 'Wellness', icon: 'spa' },
          ].map((service, i) => (
            <div 
              key={i} 
              onClick={() => onNavigate(service.id)}
              className="flex flex-col items-center gap-2 group cursor-pointer transition-transform active:scale-95"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                <span className="material-icons-round text-primary text-2xl">{service.icon}</span>
              </div>
              <span className="text-[10px] font-black text-center text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-tighter">{service.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
