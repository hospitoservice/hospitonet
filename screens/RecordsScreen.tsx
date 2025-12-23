
import React from 'react';
import { RecordItem } from '../types';

const RECORDS: RecordItem[] = [
  { id: '1', title: 'Complete Blood Count', location: 'KIMS Hospital, Kondapur', date: 'Today', status: 'Normal', type: 'lab' },
  { id: '2', title: 'General Consultation', location: 'Dr. Rajesh Kumar • Cardiologist', date: 'Yesterday', type: 'consultation' },
  { id: '3', title: 'Medicine Order #4452', location: 'Delivered • Oct 24', date: 'Oct 24', type: 'order' },
  { id: '4', title: 'Flu Vaccination', location: 'Apollo Clinic • Oct 12', date: 'Oct 12', type: 'vaccination' },
];

const RecordsScreen: React.FC = () => {
  return (
    <div className="flex flex-col pt-10">
      <header className="bg-primary text-white pt-10 pb-10 px-6 rounded-b-[3.5rem] shadow-xl relative z-40">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <span className="material-icons-round text-white cursor-pointer p-2 bg-white/10 rounded-2xl backdrop-blur-md">arrow_back</span>
            <h1 className="text-2xl font-black tracking-tight">Medical Records</h1>
          </div>
          <div className="relative">
            <span className="material-icons-round text-white cursor-pointer p-2 bg-white/10 rounded-2xl backdrop-blur-md">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
          </div>
        </div>
        <div className="relative group">
          <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">search</span>
          <input 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 border-none focus:ring-4 focus:ring-white/20 shadow-inner text-sm transition-all" 
            placeholder="Search records, dates..." 
            type="text"
          />
          <span className="material-icons-round absolute right-4 top-1/2 -translate-y-1/2 text-primary cursor-pointer">tune</span>
        </div>
      </header>

      <div className="px-6 pt-8">
        <div className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar">
          {['All Records', 'Lab Reports', 'Prescriptions', 'Vaccinations'].map((tab, i) => (
            <button key={i} className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Activity</h2>
            <button className="text-xs font-bold text-primary hover:underline">See All</button>
          </div>
          <div className="space-y-4">
            {RECORDS.slice(0, 2).map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-soft border-2 border-gray-50 dark:border-gray-800 flex items-start gap-4 hover:shadow-xl transition-all cursor-pointer">
                <div className={`p-4 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.type === 'lab' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-primary'}`}>
                  <span className="material-icons-round text-2xl">{item.type === 'lab' ? 'science' : 'description'}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight leading-none mb-1">{item.title}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-tight">{item.location}</p>
                    </div>
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">{item.date}</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    {item.status ? (
                      <span className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-green-100 dark:border-green-800/30">{item.status}</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold">Prescription available</span>
                    )}
                    <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group">
                      View <span className="material-icons-round text-sm transition-transform group-hover:translate-x-0.5">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pb-10">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Past Records</h2>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4 ml-1">October 2023</p>
              <div className="space-y-3">
                {RECORDS.slice(2).map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-gray-50 dark:border-gray-800 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all">
                    <div className="bg-gray-50 dark:bg-gray-700/50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <span className="material-icons-round text-xl">{item.type === 'order' ? 'medication' : 'vaccines'}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{item.title}</h4>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{item.location}</p>
                    </div>
                    <span className="material-icons-round text-gray-300 dark:text-gray-600">navigate_next</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <span className="material-icons-round text-2xl">add</span>
      </button>
    </div>
  );
};

export default RecordsScreen;
