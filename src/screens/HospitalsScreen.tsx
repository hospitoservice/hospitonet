import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital } from '../../types.ts';
import HospitalService from '../service/HospitalService.ts';
import UserService from '../service/UserService';
import FavouritesService from '../service/FavouritesService';

const FILTERS = ['Recommended', 'Near Me', 'Top Rated', '24/7 Open'];

const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft flex gap-4 border-2 border-gray-50 dark:border-gray-800 animate-pulse">
        <div className="w-28 h-28 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="flex gap-1.5 mt-3">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
            </div>
            <div className="flex items-end justify-between mt-4">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
        </div>
    </div>
);

const HospitalsScreen: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [favourites, setFavourites] = useState<Set<string>>(new Set());
    const [favouritesBusy, setFavouritesBusy] = useState<Set<string>>(new Set());

    useEffect(() => {
        FavouritesService.getFavouriteRefIds('HOSPITAL').then(setFavourites);
        const phone = UserService.getPhoneFromSession();
        if (!phone) return;
        UserService.getUserByPhone(phone).then(user => { if (user?.id) setUserId(user.id); }).catch(() => {});
    }, []);

    const toggleFavourite = async (hosp: Hospital) => {
        if (!userId || favouritesBusy.has(hosp.id)) return;
        const isFav = favourites.has(hosp.id);

        setFavouritesBusy(prev => new Set(prev).add(hosp.id));
        try {
            if (isFav) {
                await FavouritesService.removeFavourite(userId, 'HOSPITAL', hosp.id);
                setFavourites(prev => { const next = new Set(prev); next.delete(hosp.id); return next; });
            } else {
                await FavouritesService.addFavourite(userId, {
                    favouriteType: 'HOSPITAL',
                    refId: hosp.id,
                    name: hosp.name,
                    image: hosp.image,
                    subtitle: hosp.location,
                    rating: hosp.rating,
                    tags: hosp.tags,
                });
                setFavourites(prev => new Set(prev).add(hosp.id));
            }
        } catch (err) {
            console.error('Failed to update favourite:', err);
        } finally {
            setFavouritesBusy(prev => { const next = new Set(prev); next.delete(hosp.id); return next; });
        }
    };

    const fetchHospitals = useCallback(async (filter: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await HospitalService.getHospitals(filter);
            setHospitals(data);
        } catch (err) {
            setError('Could not load hospitals. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            fetchHospitals(activeFilter);
        }
    }, [activeFilter, fetchHospitals, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (searchDebounce.current) clearTimeout(searchDebounce.current);

        if (!value.trim()) {
            fetchHospitals(activeFilter);
            return;
        }

        searchDebounce.current = setTimeout(async () => {
            setIsSearching(true);
            setError(null);
            try {
                const data = await HospitalService.searchHospitals(value.trim());
                setHospitals(data);
            } catch (err) {
                setError('Search failed. Please try again.');
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setSearchQuery('');
    };

    const isLoading = loading || isSearching;

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen pb-32">
            {/* Header */}
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
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search hospitals..."
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-[1.5rem] py-4 pl-12 pr-12 text-sm shadow-sm focus:ring-2 focus:ring-primary transition-all dark:text-white"
                    />
                    {isSearching ? (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-primary">
                            <span className="material-icons-round text-lg">tune</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Filter chips */}
            <div className="px-4 mt-4 flex gap-3 overflow-x-auto hide-scrollbar">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterChange(filter)}
                        className={`px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${
                            activeFilter === filter && !searchQuery
                                ? 'bg-primary text-white shadow-primary/30 border-2 border-primary'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="px-6 mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {searchQuery ? 'Search Results' : 'Results'}
                    </h2>
                    {!isLoading && !error && (
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                            {hospitals.length} found
                        </span>
                    )}
                </div>

                {/* Error state */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center py-10 gap-4">
                        <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600">wifi_off</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{error}</p>
                        <button
                            onClick={() => fetchHospitals(activeFilter)}
                            className="bg-primary text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Hospital list */}
                {!isLoading && !error && hospitals.length > 0 && (
                    hospitals.map((hosp) => (
                        <div
                            key={hosp.id}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft flex gap-4 border-2 border-gray-50 dark:border-gray-800 group hover:shadow-xl transition-all cursor-pointer"
                        >
                            <div className="relative w-28 h-28 flex-shrink-0">
                                <img
                                    alt={hosp.name}
                                    className="w-full h-full object-cover rounded-2xl shadow-inner group-hover:scale-105 transition-transform"
                                    src={hosp.image}
                                />
                                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 px-2 py-0.5 rounded-lg text-[10px] font-black text-primary flex items-center shadow-md backdrop-blur-sm">
                                    <span className="material-icons text-xs mr-1 text-yellow-500">star</span> {hosp.rating}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavourite(hosp); }}
                                    disabled={favouritesBusy.has(hosp.id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-90 disabled:opacity-60"
                                >
                                    <span className={`material-icons-round text-sm ${favourites.has(hosp.id) ? 'text-red-500' : 'text-gray-400'}`}>
                                        {favourites.has(hosp.id) ? 'favorite' : 'favorite_border'}
                                    </span>
                                </button>
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
                                    <button
                                        onClick={() => navigate('/book-appointment', { state: { hospital: hosp } })}
                                        className="bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:translate-y-0.5"
                                    >
                                        Book Visit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Empty state */}
                {!isLoading && !error && hospitals.length === 0 && (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600">local_hospital</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No hospitals found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalsScreen;