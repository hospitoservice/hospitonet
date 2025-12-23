
import React, { useState } from 'react';
import { Appointment } from '../types';

interface ProfileScreenProps {
  onLogout: () => void;
}

const PREVIOUS_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    hospital: 'Apollo Hospital',
    date: 'Oct 24, 2024',
    time: '10:30 AM',
    status: 'Completed',
    image: 'https://picsum.photos/seed/doc1/100/100'
  },
  {
    id: '2',
    doctorName: 'Dr. Aman Gupta',
    specialty: 'General Physician',
    hospital: 'Yashoda Hospital',
    date: 'Sep 12, 2024',
    time: '02:00 PM',
    status: 'Completed',
    image: 'https://picsum.photos/seed/doc2/100/100'
  }
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'profile' | 'appointments'>('profile');

  const menuItems = [
    { icon: 'calendar_today', label: 'My Appointments', color: 'text-blue-500', action: () => setActiveView('appointments') },
    { icon: 'people', label: 'Family Members', color: 'text-purple-500' },
    { icon: 'payment', label: 'Payment Methods', color: 'text-green-500' },
    { icon: 'help_outline', label: 'Help & Support', color: 'text-cyan-500' },
    { icon: 'settings', label: 'App Settings', color: 'text-gray-500' },
  ];

  if (activeView === 'appointments') {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-24">
        <header className="bg-primary pt-14 pb-8 px-6 rounded-b-[3rem] shadow-xl text-white">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('profile')} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-black tracking-tight">My Appointments</h2>
          </div>
        </header>
        
        <div className="px-6 py-8 space-y-4">
          <div className="flex gap-2 mb-4">
             <button className="flex-1 bg-primary text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Upcoming</button>
             <button className="flex-1 bg-white dark:bg-gray-800 text-gray-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700">Past</button>
          </div>

          {PREVIOUS_APPOINTMENTS.map((app) => (
            <div key={app.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
              <img src={app.image} className="w-16 h-16 rounded-2xl object-cover" alt={app.doctorName} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-none">{app.doctorName}</h4>
                    <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">{app.specialty}</p>
                  </div>
                  <span className="text-[8px] font-black uppercase bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-1 rounded-lg">{app.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span className="material-icons-round text-xs">calendar_today</span>
                      {app.date}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span className="material-icons-round text-xs">schedule</span>
                      {app.time}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-10 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">End of List</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-16 pb-12 px-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl mb-4 relative">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" 
              alt="User" 
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Alex Thompson</h2>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Patient ID: #HN-2025-01</p>
          
          <div className="mt-8 flex gap-6 w-full justify-center">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-white/60 font-black uppercase mb-1">Blood</span>
              <span className="text-lg font-black text-white">O+</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-white/60 font-black uppercase mb-1">Height</span>
              <span className="text-lg font-black text-white">182<span className="text-[10px]">cm</span></span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-white/60 font-black uppercase mb-1">Weight</span>
              <span className="text-lg font-black text-white">76<span className="text-[10px]">kg</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">Account Dashboard</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-soft border-2 border-gray-50 dark:border-gray-800 overflow-hidden">
          {menuItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${item.color}`}>
                  <span className="material-icons-round">{item.icon}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.label}</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-gray-600">chevron_right</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onLogout}
          className="mt-10 w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/20 active:scale-[0.98] transition-all"
        >
          <span className="material-icons-round text-lg">logout</span>
          Logout from Hospitonet
        </button>

        <p className="text-center mt-8 text-[9px] text-gray-400 font-bold uppercase tracking-widest pb-10">
          Hospitonet v3.1.2 (Beta)
        </p>
      </div>
    </div>
  );
};

export default ProfileScreen;
