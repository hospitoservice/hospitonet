import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Screen } from '../../types.ts';

const HOSPITALS: Hospital[] = [
  { id: '1', name: 'KIMS Hospital', location: 'Kondapur, Hyderabad', distance: '2.5 km', rating: 4.5, tags: ['Multispeciality', '24/7'], consultationFee: 800, image: 'https://picsum.photos/seed/hosp1/200/200' },
  { id: '2', name: 'Care Hospital', location: 'Gachibowli, Hyderabad', distance: '4.1 km', rating: 4.2, tags: ['Cardiology', 'Surgery'], consultationFee: 950, image: 'https://picsum.photos/seed/hosp2/200/200' },
  { id: '3', name: 'Yashoda Hospital', location: 'Secunderabad', distance: '8.0 km', rating: 4.8, tags: ['General', 'Pediatrics'], consultationFee: 700, image: 'https://picsum.photos/seed/hosp3/200/200' },
  { id: '4', name: 'Sunshine Hospital', location: 'Madhapur, Hyderabad', distance: '3.2 km', rating: 3.9, tags: ['Orthopedic'], consultationFee: 650, image: 'https://picsum.photos/seed/hosp4/200/200' },
  { id: '5', name: 'KIMS Hospital', location: 'Kondapur, Hyderabad', distance: '2.5 km', rating: 4.5, tags: ['Multispeciality', '24/7'], consultationFee: 800, image: 'https://picsum.photos/seed/hosp1/200/200' },
  { id: '6', name: 'Care Hospital', location: 'Gachibowli, Hyderabad', distance: '4.1 km', rating: 4.2, tags: ['Cardiology', 'Surgery'], consultationFee: 950, image: 'https://picsum.photos/seed/hosp2/200/200' },
  { id: '7', name: 'Yashoda Hospital', location: 'Secunderabad', distance: '8.0 km', rating: 4.8, tags: ['General', 'Pediatrics'], consultationFee: 700, image: 'https://picsum.photos/seed/hosp3/200/200' },
  { id: '8', name: 'Sunshine Hospital', location: 'Madhapur, Hyderabad', distance: '3.2 km', rating: 3.9, tags: ['Orthopedic'], consultationFee: 650, image: 'https://picsum.photos/seed/hosp4/200/200' },
];

const FILTERS = ['Recommended', 'Near Me', 'Top Rated', '24/7 Open'];

const HospitalsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const navigate = useNavigate();

  // Enhanced filtering logic
  const filteredHospitals = HOSPITALS.filter(h => {
    if (activeFilter === 'Near Me') return parseFloat(h.distance) < 4;
    if (activeFilter === 'Top Rated') return h.rating >= 4.5;
    if (activeFilter === '24/7 Open') return h.tags.includes('24/7');
    return true;
  });

  return (
      <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen pb-32">
        {/* New Header */}
        <header className="px-6 py-4 flex flex-col gap-4 relative z-[100]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                  onClick={() => navigate(-1)}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <span className="material-icons-round text-primary text-2xl">arrow_back</span>
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Hospitals in</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white">Hyderabad</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                  onClick={() => navigate('/favourites')}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <span className="material-icons-round text-primary text-2xl">favorite_border</span>
              </button>
              <button
                  onClick={() => navigate('/notifications')}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700 relative"
              >
                <span className="material-icons-round text-primary text-2xl">notifications_none</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative group z-0">
            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">search</span>
            <input
                type="text"
                placeholder="Search hospitals..."
                className="w-full bg-white dark:bg-gray-800 border-none rounded-[1.5rem] py-4 pl-12 pr-12 text-sm shadow-sm focus:ring-2 focus:ring-primary transition-all dark:text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-primary">
              <span className="material-icons-round text-lg">tune</span>
            </button>
          </div>
        </header>

        <div className="px-4 mt-4 flex gap-3 overflow-x-auto hide-scrollbar">
          {FILTERS.map((filter) => (
              <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${
                      activeFilter === filter
                          ? 'bg-primary text-white shadow-primary/30 border-2 border-primary'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-800'
                  }`}
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
                              <span key={idx} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700">
                        {tag}
                      </span>
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
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No hospitals found matching your criteria</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default HospitalsScreen;