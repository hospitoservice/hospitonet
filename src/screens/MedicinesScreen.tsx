import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Medicine, Appointment } from '../../types.ts';
import PrescriptionHub from '@/src/components/PrescriptionHub.tsx';
import { Medicines } from '@/src/resources/Medicines';
import { MEDICINES_CONFIG } from '@/src/resources/MedicinesScreenConfig.js';
import MedicineService from '../service/MedicineService';
import CartScreen, { CartItem } from '@/src/screens/CartScreen';

const C = MEDICINES_CONFIG;

const MedicinesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>(Medicines as Medicine[]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    MedicineService.getMedicines().then(setMedicines);
  }, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPrescriptionHub, setShowPrescriptionHub] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        hospital: 'Apollo Hospital',
        date: 'Oct 24, 2024',
        time: '10:30 AM',
        status: 'Completed',
        image: 'https://picsum.photos/seed/doc1/100/100',
        prescription: ['https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&w=400&q=80'],
      },
      {
        id: '2',
        doctorName: 'Dr. Aman Gupta',
        specialty: 'General Physician',
        hospital: 'Yashoda Hospital',
        date: 'Sep 12, 2024',
        time: '02:00 PM',
        status: 'Completed',
        image: 'https://picsum.photos/seed/doc2/100/100',
        prescription: ['https://images.unsplash.com/photo-1628771065518-0d82f1110547?auto=format&fit=crop&w=400&q=80'],
      },
    ];
    setAppointments(mockAppointments);
  }, []);

  const handlePrescriptionSelect = (_prescription: { image: string; appointmentId?: string }) => {
    // prescriptions handled by PrescriptionHub internally
  };

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === medicine.id);
      if (existing) return prev.map(i => i.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const toggleFavourite = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Sticky Header */}
      <div className="fixed top-0 max-w-md w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <span className="material-icons-round text-gray-800 dark:text-white text-xl">arrow_back</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="material-icons-outlined text-sm text-cyan-500">location_on</span>
              <span className="text-[11px] font-black tracking-widest uppercase text-gray-500 dark:text-gray-400">{C.location.city}</span>
              <span className="material-icons-outlined text-xs text-gray-400">expand_more</span>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <span className="material-icons-outlined text-gray-700 dark:text-gray-200">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white dark:border-gray-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
              <span className="material-icons-outlined text-[20px]">search</span>
            </span>
            <input
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-transparent text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 transition-all"
              placeholder={C.search.placeholder}
              type="text"
            />
          </div>
        </div>
      </div>

      {showPrescriptionHub && (
        <PrescriptionHub
          appointments={appointments}
          onPrescriptionSelect={handlePrescriptionSelect}
          onClose={() => setShowPrescriptionHub(false)}
        />
      )}

      <main className="pt-40 px-5 pb-32">

        {/* Banner */}
        <div className="mb-6 rounded-[2rem] overflow-hidden relative h-44 flex items-center shadow-xl cursor-pointer group active:scale-[0.98] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-700" />
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
              <circle cx="160" cy="-10" r="80" fill="white" />
              <circle cx="10" cy="90" r="60" fill="white" />
            </svg>
          </div>
          <div className="relative z-10 px-7 py-6 flex-1">
            <span className="inline-block bg-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2 border border-white/30">
              {C.banner.subtitle}
            </span>
            <h2 className="text-white font-black text-4xl tracking-tight leading-none mb-4">{C.banner.saveBadge}</h2>
            <button className="bg-white text-cyan-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:translate-y-0.5 transition-all">
              {C.banner.ctaLabel}
            </button>
          </div>
          <div className="absolute right-4 bottom-0 opacity-25 group-hover:opacity-40 transition-opacity">
            <span className="material-icons-outlined text-white" style={{ fontSize: '9rem' }}>medication</span>
          </div>
        </div>

        {/* Prescription Hub */}
        <button
          onClick={() => setShowPrescriptionHub(true)}
          className="w-full mb-6 flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-outlined text-cyan-600 dark:text-cyan-400 text-2xl">receipt_long</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-gray-900 dark:text-white leading-none mb-1">{C.prescriptionHub.title}</p>
            <p className="text-[11px] text-gray-400 font-medium">{C.prescriptionHub.subtitle}</p>
          </div>
          <span className="material-icons-round text-gray-300 dark:text-gray-600">chevron_right</span>
        </button>

        {/* Catalogue Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">{C.catalog.sectionTitle}</h2>
          <button className="text-cyan-500 text-xs font-black uppercase tracking-widest hover:underline">{C.catalog.seeAllLabel}</button>
        </div>

        {/* Medicine Grid */}
        <div className="grid grid-cols-2 gap-3">
          {medicines.map((med) => {
            const inCart = cart.find(i => i.id === med.id);
            const isFav = favourites.has(med.id);
            const discountPct = med.originalPrice
              ? Math.round((1 - med.price / med.originalPrice) * 100)
              : null;

            return (
              <div
                key={med.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/60 flex flex-col group hover:shadow-md transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                  <img
                    src={med.image}
                    alt={med.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                  {/* Discount badge */}
                  {discountPct && (
                    <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                      -{discountPct}%
                    </div>
                  )}

                  {/* Favourite */}
                  <button
                    onClick={() => toggleFavourite(med.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center shadow transition-all active:scale-90"
                  >
                    <span className={`material-icons-round text-sm ${isFav ? 'text-red-500' : 'text-gray-300'}`}>
                      {isFav ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5 truncate">
                    {med.manufacturer}
                  </p>
                  <h3 className="font-black text-[10px] text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1.5 flex-1">
                    {med.name}
                  </h3>

                  {/* Rating + Price row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg">
                      <span className="material-icons-round text-amber-400 text-[9px]">star</span>
                      <span className="text-[8px] font-black text-amber-600 dark:text-amber-400">{med.rating}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">₹{med.price.toFixed(0)}</span>
                      {med.originalPrice && (
                        <span className="text-[8px] text-gray-400 line-through">₹{med.originalPrice.toFixed(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Add to cart */}
                  {inCart ? (
                    <div className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/20 rounded-xl px-2 py-1.5 border border-cyan-200 dark:border-cyan-800">
                      <button
                        onClick={() => {
                          if (inCart.quantity === 1) removeFromCart(med.id);
                          else setCart(prev => prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity - 1 } : i));
                        }}
                        className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow text-cyan-600 dark:text-cyan-400 font-black text-base leading-none active:scale-90 transition-transform"
                      >
                        −
                      </button>
                      <span className="text-[11px] font-black text-cyan-700 dark:text-cyan-300">{inCart.quantity}</span>
                      <button
                        onClick={() => addToCart(med)}
                        className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow text-white font-black text-base leading-none active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(med)}
                      className="w-full py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-[8px] uppercase tracking-widest active:scale-95 transition-all shadow hover:brightness-110"
                    >
                      {C.tile.addToCartLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CartScreen
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default MedicinesScreen;