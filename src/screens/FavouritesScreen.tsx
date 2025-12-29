import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FAVOURITES } from '../resources/Favourites';

const FavouritesScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/30 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <span className="material-icons-round text-gray-800 dark:text-white">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favourites</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Medicines Section */}
        {FAVOURITES.medicines.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Medicines</h2>
            <div className="grid grid-cols-2 gap-4">
              {FAVOURITES.medicines.map(medicine => (
                <div key={medicine.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <img 
                    src={medicine.image} 
                    alt={medicine.name} 
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{medicine.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{medicine.manufacturer}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">₹{medicine.price}</span>
                    <button className="text-primary">
                      <span className="material-icons-round text-2xl">favorite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hospitals Section */}
        {FAVOURITES.hospitals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hospitals</h2>
            <div className="space-y-3">
              {FAVOURITES.hospitals.map(hospital => (
                <div key={hospital.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{hospital.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hospital.location}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                        {hospital.rating} ★
                      </span>
                      {hospital.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Section */}
        {FAVOURITES.doctors.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Doctors</h2>
            <div className="space-y-3">
              {FAVOURITES.doctors.map(doctor => (
                <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                    <p className="text-xs text-gray-400">{doctor.hospital}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{doctor.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritesScreen;
