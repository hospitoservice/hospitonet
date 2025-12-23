
import React, { useState } from 'react';
import { Hospital } from '../types';

const HOSPITALS: Hospital[] = [
  { id: '1', name: 'KIMS Hospital', location: 'Kondapur, Hyderabad', distance: '2.5 km', rating: 4.5, tags: ['Multispeciality', '24/7'], consultationFee: 800, image: 'https://picsum.photos/seed/hosp1/200/200' },
  { id: '2', name: 'Care Hospital', location: 'Gachibowli, Hyderabad', distance: '4.1 km', rating: 4.2, tags: ['Cardiology', 'Surgery'], consultationFee: 950, image: 'https://picsum.photos/seed/hosp2/200/200' },
  { id: '3', name: 'Yashoda Hospital', location: 'Secunderabad', distance: '8.0 km', rating: 4.8, tags: ['General', 'Pediatrics'], consultationFee: 700, image: 'https://picsum.photos/seed/hosp3/200/200' },
  { id: '4', name: 'Sunshine Hospital', location: 'Madhapur, Hyderabad', distance: '3.2 km', rating: 3.9, tags: ['Orthopedic'], consultationFee: 650, image: 'https://picsum.photos/seed/hosp4/200/200' },
];

const FILTERS = ['Recommended', 'Near Me', 'Top Rated', '24/7 Open'];

const HospitalsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  // Enhanced filtering logic
  const filteredHospitals = HOSPITALS.filter(h => {
    if (activeFilter === 'Near Me') return parseFloat(h.distance) < 4;
    if (activeFilter === 'Top Rated') return h.rating >= 4.5;
    if (activeFilter === '24/7 Open') return h.tags.includes('24/7');
    return true;
  });

  return (
    <div className="flex flex-col pt-10 bg-gray-50 dark:bg-gray-900 min-h-screen pb-32">
      <header className="bg-primary pt-10 pb-10 px-6 rounded-b-[3.5rem] shadow-xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white/90">
            <span className="material-icons text-sm">location_on</span>
            <span className="text-sm font-black tracking-tight">Telangana, Hyderabad</span>
            <span className="material-icons text-sm">expand_more</span>
          </div>
          <div className="flex gap-3 text-white">
            <button className="p-2 bg-white/10 rounded-2xl backdrop-blur-md">
              <span className="material-icons">favorite_border</span>
            </button>
            <button className="p-2 bg-white/10 rounded-2xl backdrop-blur-md relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
            </button>
          </div>
        </div>
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-icons">search</span>
          </span>
          <input 
            className="block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-2xl" 
            placeholder="Search hospitals..." 
            type="text"
          />
        </div>
      </header>

      <div className="px-6 mt-8 flex gap-3 overflow-x-auto hide-scrollbar">
        {FILTERS.map((filter) => (
          <button 
            key={filter} 
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${activeFilter === filter ? 'bg-primary text-white shadow-primary/30 border-2 border-primary' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-800'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="px-6 mt-8 space-y-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Results</h2>
        {filteredHospitals.length > 0 ? (
          filteredHospitals.map((hosp) => (
            <div key={hosp.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft flex gap-4 border-2 border-gray-50 dark:border-gray-800 group hover:shadow-xl transition-all cursor-pointer">
              <div className="relative w-28 h-28 flex-shrink-0">
                <img alt={hosp.name} className="w-full h-full object-cover rounded-2xl shadow-inner group-hover:scale-105 transition-transform" src={hosp.image} />
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 px-2 py-0.5 rounded-lg text-[10px] font-black text-primary flex items-center shadow-md backdrop-blur-sm">
                  <span className="material-icons text-xs mr-1 text-yellow-500">star</span> {hosp.rating}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">{hosp.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-1 tracking-tight">{hosp.location} • {hosp.distance}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hosp.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                     <span className="text-sm font-black text-primary">₹{hosp.consultationFee}</span>
                  </div>
                  <button className="bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:translate-y-0.5">
                    Book Visit
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center opacity-40">
             <span className="material-icons-round text-6xl mb-4">search_off</span>
             <p className="font-black text-sm uppercase tracking-widest">No matching hospitals found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsScreen;
