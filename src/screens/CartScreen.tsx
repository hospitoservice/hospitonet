import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Medicine } from '../../types.ts';
import { MEDICINES_CONFIG } from '@/src/resources/MedicinesScreenConfig.js';

export interface CartItem extends Medicine {
  quantity: number;
}

interface CartScreenProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
}

const C = MEDICINES_CONFIG;

const CartScreen: React.FC<CartScreenProps> = ({ isOpen, onClose, cart, onRemoveItem }) => {
  const navigate = useNavigate();

  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col rounded-l-[3rem] overflow-hidden animate-slide-in-right">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-6 bg-white/20 p-2 rounded-2xl hover:bg-white/30 transition-all"
          >
            <span className="material-icons-round text-lg">close</span>
          </button>
          <h2 className="text-3xl font-black tracking-tight mt-2">{C.cart.drawerTitle}</h2>
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">
            {C.cart.itemsLabel(cartCount)}
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 gap-3">
              <span className="material-icons-round text-7xl">shopping_bag</span>
              <p className="font-black text-sm uppercase tracking-widest">{C.cart.emptyTitle}</p>
              <p className="text-xs text-gray-400">{C.cart.emptySubtitle}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-900 dark:text-white leading-tight line-clamp-1 uppercase">
                    {item.name}
                  </p>
                  <p className="text-sm font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                    ₹{item.price.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <span className="material-icons-round text-xl">delete_outline</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {C.cart.subtotalLabel}
              </span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate('/checkout', { state: { cart, total: cartTotal } });
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/30 active:scale-95 transition-all"
            >
              {C.cart.checkoutLabel}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default CartScreen;