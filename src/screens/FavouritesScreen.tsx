import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import FavouritesService, { Favourites } from '../service/FavouritesService';

const FALLBACK_IMAGE: Record<'medicine' | 'hospital' | 'doctor', string> = {
  medicine: 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=400',
  hospital: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=400',
  doctor: 'https://picsum.photos/seed/doc/200/200',
};

const FavouritesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<Favourites>({ medicines: [], hospitals: [], doctors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const phone = UserService.getPhoneFromSession();
      if (!phone) { setError('Unable to identify your account. Please log in again.'); return; }
      const user = await UserService.getUserByPhone(phone);
      if (!user?.id) { setError('Unable to identify your account. Please log in again.'); return; }
      setUserId(user.id);
      setFavourites(await FavouritesService.getFavourites());
    } catch (err) {
      console.error('Failed to load favourites:', err);
      setError('Failed to load favourites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (type: 'MEDICINE' | 'HOSPITAL' | 'DOCTOR', refId: string) => {
    if (!userId) return;
    const key = `${type}:${refId}`;
    setRemovingKey(key);
    try {
      await FavouritesService.removeFavourite(userId, type, refId);
      setFavourites(prev => ({
        medicines: type === 'MEDICINE' ? prev.medicines.filter(m => m.id !== refId) : prev.medicines,
        hospitals: type === 'HOSPITAL' ? prev.hospitals.filter(h => h.id !== refId) : prev.hospitals,
        doctors: type === 'DOCTOR' ? prev.doctors.filter(d => d.id !== refId) : prev.doctors,
      }));
    } catch (err) {
      console.error('Failed to remove favourite:', err);
    } finally {
      setRemovingKey(null);
    }
  };

  const isEmpty = !loading && !error
    && favourites.medicines.length === 0
    && favourites.hospitals.length === 0
    && favourites.doctors.length === 0;

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
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl h-24 bg-white dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-700" />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
            <button onClick={load} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-gray-300 dark:text-gray-700 text-5xl mb-3">favorite_border</span>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No favourites yet.</p>
            <p className="text-xs text-gray-400 mt-1">Tap the heart icon on medicines or hospitals to save them here.</p>
          </div>
        )}

        {/* Medicines Section */}
        {!loading && !error && favourites.medicines.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Medicines</h2>
            <div className="grid grid-cols-2 gap-4">
              {favourites.medicines.map(medicine => (
                <div key={medicine.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <img
                    src={medicine.image || FALLBACK_IMAGE.medicine}
                    alt={medicine.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{medicine.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{medicine.manufacturer}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">₹{medicine.price.toFixed(0)}</span>
                    <button
                      onClick={() => handleRemove('MEDICINE', medicine.id)}
                      disabled={removingKey === `MEDICINE:${medicine.id}`}
                      className="text-primary disabled:opacity-50"
                    >
                      <span className="material-icons-round text-2xl">favorite</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hospitals Section */}
        {!loading && !error && favourites.hospitals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hospitals</h2>
            <div className="space-y-3">
              {favourites.hospitals.map(hospital => (
                <div key={hospital.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3">
                  <img
                    src={hospital.image || FALLBACK_IMAGE.hospital}
                    alt={hospital.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{hospital.name}</h3>
                      <button
                        onClick={() => handleRemove('HOSPITAL', hospital.id)}
                        disabled={removingKey === `HOSPITAL:${hospital.id}`}
                        className="text-primary flex-shrink-0 disabled:opacity-50"
                      >
                        <span className="material-icons-round text-xl">favorite</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hospital.location}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {hospital.rating != null && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                          {hospital.rating} ★
                        </span>
                      )}
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
        {!loading && !error && favourites.doctors.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Doctors</h2>
            <div className="space-y-3">
              {favourites.doctors.map(doctor => (
                <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3">
                  <img
                    src={doctor.image || FALLBACK_IMAGE.doctor}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{doctor.name}</h3>
                      <button
                        onClick={() => handleRemove('DOCTOR', doctor.id)}
                        disabled={removingKey === `DOCTOR:${doctor.id}`}
                        className="text-primary flex-shrink-0 disabled:opacity-50"
                      >
                        <span className="material-icons-round text-xl">favorite</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                    {doctor.hospital && <p className="text-xs text-gray-400">{doctor.hospital}</p>}
                    {doctor.rating != null && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{doctor.rating}</span>
                      </div>
                    )}
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
