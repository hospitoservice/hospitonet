import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

type PaymentMethod = 'upi' | 'card' | 'cod';

const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [], total = 0 } = (location.state as { cart: CartItem[]; total: number }) ?? {};

  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const deliveryFee = total > 500 ? 0 : 40;
  const grandTotal = total + deliveryFee;

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const canProceed = () => {
    if (method === 'upi') return /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId);
    if (method === 'card')
      return card.number.replace(/\s/g, '').length === 16 && card.expiry.length === 5 && card.cvv.length >= 3 && card.name.trim().length > 2;
    return true;
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/40 animate-bounce">
          <span className="material-icons-round text-white text-5xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Order Placed!</h1>
        <p className="text-gray-400 text-sm mb-1">Your medicines are on their way.</p>
        <p className="text-cyan-400 font-bold text-sm mb-10">Expected delivery: 2–3 business days</p>
        <button
          onClick={() => navigate('/medicines')}
          className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/30"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-gray-300 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span className="material-icons-round text-gray-800 dark:text-white text-xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Checkout</h1>
        </div>
      </div>

      <div className="px-5 pt-5 pb-36 space-y-4">

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <button
            onClick={() => setSummaryOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                <span className="material-icons-outlined text-cyan-600 dark:text-cyan-400 text-lg">receipt_long</span>
              </div>
              <span className="font-black text-sm text-gray-900 dark:text-white">
                Order Summary
                <span className="ml-2 text-[10px] font-bold text-gray-400">({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
              </span>
            </div>
            <span className={`material-icons-round text-gray-400 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {summaryOpen && (
            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-700 flex-shrink-0" />
                  <p className="flex-1 text-[11px] font-bold text-gray-700 dark:text-gray-300 line-clamp-1">{item.name}</p>
                  <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 whitespace-nowrap">×{item.quantity}</span>
                  <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 whitespace-nowrap">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-bold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Delivery fee</span>
              {deliveryFee === 0
                ? <span className="font-bold text-green-500">FREE</span>
                : <span className="font-bold">₹{deliveryFee.toFixed(2)}</span>}
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span>
              <span className="text-cyan-600 dark:text-cyan-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-4 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-icons-outlined text-blue-600 dark:text-blue-400 text-lg">location_on</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5">Deliver to</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">123, Jubilee Hills, Hyderabad, Telangana – 500033</p>
          </div>
          <button className="text-cyan-500 text-[10px] font-black uppercase tracking-wider mt-0.5">Change</button>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white mb-3 px-1">Payment Method</h2>

          <div className="space-y-3">
            {/* UPI */}
            <PaymentCard
              selected={method === 'upi'}
              onSelect={() => setMethod('upi')}
              icon="account_balance_wallet"
              iconBg="bg-purple-50 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
              title="UPI"
              subtitle="Pay via any UPI app"
            >
              {method === 'upi' && (
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full pl-4 pr-16 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all font-mono"
                    />
                    {upiId && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 material-icons-round text-lg ${/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId) ? 'text-green-500' : 'text-red-400'}`}>
                        {/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId) ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    {['GPay', 'PhonePe', 'Paytm'].map(app => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId('')}
                        className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </PaymentCard>

            {/* Card */}
            <PaymentCard
              selected={method === 'card'}
              onSelect={() => setMethod('card')}
              icon="credit_card"
              iconBg="bg-blue-50 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              title="Credit / Debit Card"
              subtitle="Visa, Mastercard, RuPay"
            >
              {method === 'card' && (
                <div className="mt-3 space-y-2.5">
                  {/* Card preview strip */}
                  <div className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center px-4 gap-3 overflow-hidden relative">
                    <span className="material-icons-round text-white/60 text-base">credit_card</span>
                    <span className="text-white font-mono text-xs tracking-widest flex-1">
                      {card.number || '•••• •••• •••• ••••'}
                    </span>
                    <span className="text-white/70 text-[10px] font-mono">{card.expiry || 'MM/YY'}</span>
                  </div>

                  <input
                    type="tel"
                    value={card.number}
                    onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    placeholder="Card number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono tracking-wider"
                  />
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={card.expiry}
                      onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono"
                    />
                    <input
                      type="tel"
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="CVV"
                      className="w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                    placeholder="Cardholder name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all uppercase tracking-wider"
                  />
                </div>
              )}
            </PaymentCard>

            {/* COD */}
            <PaymentCard
              selected={method === 'cod'}
              onSelect={() => setMethod('cod')}
              icon="payments"
              iconBg="bg-green-50 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
              title="Cash on Delivery"
              subtitle="Pay when your order arrives"
            >
              {method === 'cod' && (
                <div className="mt-3 flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 border border-green-100 dark:border-green-800">
                  <span className="material-icons-outlined text-green-500 text-lg mt-0.5">info</span>
                  <p className="text-[11px] text-green-700 dark:text-green-300 leading-relaxed font-medium">
                    Keep exact change ready. Our delivery partner will collect ₹{grandTotal.toFixed(2)} at your doorstep.
                  </p>
                </div>
              )}
            </PaymentCard>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800">
        <button
          disabled={!canProceed()}
          onClick={() => setOrderPlaced(true)}
          className={[
            'w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3',
            canProceed()
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-[0.98]'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          <span className="material-icons-round text-xl">lock</span>
          Place Order · ₹{grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

/* ── Reusable payment card shell ── */
interface PaymentCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ selected, onSelect, icon, iconBg, iconColor, title, subtitle, children }) => (
  <div
    className={[
      'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
      selected
        ? 'border-cyan-400 bg-white dark:bg-gray-800 shadow-md shadow-cyan-500/10'
        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800',
    ].join(' ')}
  >
    <button onClick={onSelect} className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={`material-icons-outlined text-xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-0.5">{title}</p>
        <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>
      </div>
      <div className={[
        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
        selected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300 dark:border-gray-600',
      ].join(' ')}>
        {selected && <span className="material-icons-round text-white text-xs">check</span>}
      </div>
    </button>
    {children && <div className="px-4 pb-4">{children}</div>}
  </div>
);

export default CheckoutScreen;