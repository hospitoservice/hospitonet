import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Medicine, Appointment } from '../../types.ts';
import PrescriptionHub from '@/src/components/PrescriptionHub.tsx';
import {Medicines} from "@/src/resources/Medicines";

// Using standard HTML elements with Tailwind CSS instead of React Native components

interface CartItem extends Medicine {
  quantity: number;
}

const MEDICINES= Medicines;

const MedicinesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPrescriptionHub, setShowPrescriptionHub] = useState(false);
  const [prescriptionImages, setPrescriptionImages] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Mock appointments data - in a real app, this would come from an API
  useEffect(() => {
    const fetchAppointments = async () => {
      // This would be an API call in a real app
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
          prescription: [
            'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&w=400&q=80',
          ]
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
          prescription: [
            'https://images.unsplash.com/photo-1628771065518-0d82f1110547?auto=format&fit=crop&w=400&q=80',
          ]
        }
      ];
      setAppointments(mockAppointments);
    };

    fetchAppointments();

    // Check camera permissions
    const checkCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop all tracks in the stream
          stream.getTracks().forEach(track => track.stop());
          setHasCameraPermission(true);
        } catch (err) {
          console.error('Camera access denied:', err);
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(false);
      }
    };
    
    checkCameraPermission();
  }, []);

  const handlePrescriptionSelect = (prescription: { image: string; appointmentId?: string }) => {
    setPrescriptionImages(prev => [...prev, prescription.image]);
    // In a real app, you would process the prescription image here
    // and extract medicine information
  };

  const addToCart = (medicine: Medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === medicine.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [activeView, setActiveView] = useState<'profile' | 'appointments'>('profile');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/30 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <span className="material-icons-round text-gray-800 dark:text-white">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medicines</h1>
        </div>
      </div>
      {showPrescriptionHub && (
        <PrescriptionHub
          appointments={appointments}
          onPrescriptionSelect={handlePrescriptionSelect}
          onClose={() => setShowPrescriptionHub(false)}
        />
      )}
      
      <div className="pt-0">
      <div className="fixed top-0 max-w-md w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button
                onClick={() => navigate('/')}
                className="p-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/30 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <span className="material-icons-round text-gray-800 dark:text-white">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-sm text-primary">location_on</span>
              <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">Telangana, HYD</span>
              <span className="material-icons-outlined text-xs text-gray-400">expand_more</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none shadow-sm"
              >
                <span className="material-icons-outlined text-gray-600 dark:text-gray-300">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white dark:border-gray-900 shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <span className="material-icons-outlined">search</span>
            </span>
            <input 
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm bg-gray-50 dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all" 
              placeholder="Search health products..." 
              type="text"
            />
          </div>
        </div>
      </div>

      <main className="mt-32 px-6 pb-40">
        {/* Banner */}
        <div className="mb-8 rounded-[2.5rem] overflow-hidden shadow-2xl relative h-48 w-full bg-gray-900 flex items-center justify-between p-8 group cursor-pointer transition-transform active:scale-[0.98]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-2/3 z-10">
            <h2 className="text-white font-black text-3xl mb-1 tracking-tight">SAVE 25%</h2>
            <p className="text-white/80 text-[10px] mb-6 font-black uppercase tracking-[0.2em]">Hospitonet Direct</p>
            <button className="bg-white text-primary px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:translate-y-0.5 transition-all">Order Now</button>
          </div>
          <div className="absolute -right-5 bottom-0 h-40 w-40 flex items-center justify-center">
             <span className="material-icons-outlined text-white/20 text-[10rem] rotate-12 group-hover:rotate-0 transition-transform">medication</span>
          </div>
        </div>

        {/* Prescription Box */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-5 shadow-sm mb-8 flex items-center justify-between border-2 border-gray-50 dark:border-gray-800 transition-all hover:shadow-lg active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-2xl text-cyan-600">
              <span className="material-icons-outlined text-2xl">receipt_long</span>
            </div>
            <div>
              <button onClick={()=> setShowPrescriptionHub(true)}>
              <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-tight leading-none mb-1">Prescription Hub</h3>
              </button>
            </div>
          </div>
          {/*<button className="bg-primary/10 text-primary p-2 rounded-xl">*/}
          {/*  <span className="material-icons-outlined">add_photo_alternate</span>*/}
          {/*</button>*/}
        </div>

        {/* Grid */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">Best Sellers</h2>
          <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">See All</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {MEDICINES.map((med) => (
            <div key={med.id} className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full relative group hover:shadow-md transition-all">
              <button className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors z-10 focus:outline-none">
                <span className="material-icons-outlined text-xl">favorite_border</span>
              </button>
              <div className="h-24 w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                <img alt={med.name} className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500" src={med.image} />
                {med.discount && (
                  <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm border border-white/20 backdrop-blur-sm">{med.discount}</span>
                )}
              </div>
              <div className="flex-grow px-1">
                <h3 className="font-bold text-[10px] text-gray-900 dark:text-white line-clamp-2 mb-0.5 leading-tight tracking-tight h-8">{med.name}</h3>
                <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">{med.manufacturer}</p>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center text-[8px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold">
                    {med.rating} <span className="text-[7px] material-icons-outlined ml-0.5">star</span>
                  </div>
                  <span className="text-[8px] text-gray-400">({med.reviews})</span>
                </div>
              </div>
              <div className="mt-auto px-1 pb-1">
                <div className="flex items-end justify-between">
                   <span className="text-sm font-black text-primary">₹{med.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => addToCart(med)}
                  className="w-full bg-gray-900 text-white dark:bg-white dark:text-black font-black text-[9px] uppercase tracking-widest py-3 rounded-2xl transition-all active:scale-95 shadow-md hover:brightness-110"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right rounded-l-[3rem] overflow-hidden">
            <div className="p-8 bg-primary text-white relative">
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setIsCartOpen(false)} className="bg-white/20 p-2 rounded-2xl hover:bg-white/30 transition-all">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              <h2 className="text-3xl font-black tracking-tight mt-4">Shopping Bag</h2>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-2">{cartCount} Items Selected</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 hide-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <span className="material-icons-round text-7xl mb-4">shopping_bag</span>
                  <p className="font-black text-sm uppercase tracking-widest">Bag is Empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex-shrink-0 overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-[11px] font-black text-gray-900 dark:text-white tracking-tight leading-tight line-clamp-1 uppercase">{item.name}</h4>
                      <p className="text-sm font-black text-primary">₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-200 hover:text-red-500 transition-colors p-2"
                    >
                      <span className="material-icons-round text-xl">delete_outline</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="text-2xl font-black text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}
      </style>
    </div>
    </div>
  );
};

export default MedicinesScreen;
