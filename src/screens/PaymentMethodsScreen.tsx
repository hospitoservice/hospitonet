import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService, { PaymentMethod } from '../service/UserService';

type MethodType = 'CARD' | 'UPI' | 'OTHER';

const BLANK_CARD = { number: '', expiry: '', name: '' };

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function detectBrand(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^(60|65|81|82)/.test(digits)) return 'RuPay';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
}

const TYPE_META: Record<MethodType, { icon: string; iconBg: string; iconColor: string; title: string; subtitle: string }> = {
  CARD:  { icon: 'credit_card',            iconBg: 'bg-blue-50 dark:bg-blue-900/30',     iconColor: 'text-blue-600 dark:text-blue-400',     title: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay' },
  UPI:   { icon: 'account_balance_wallet', iconBg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', title: 'UPI',                  subtitle: 'Pay via any UPI app' },
  OTHER: { icon: 'payments',               iconBg: 'bg-green-50 dark:bg-green-900/30',   iconColor: 'text-green-600 dark:text-green-400',   title: 'Other',                subtitle: 'Wallet, net banking, etc.' },
};

const TypeCard: React.FC<{
  type: MethodType; selected: boolean; onSelect: () => void; children?: React.ReactNode;
}> = ({ type, selected, onSelect, children }) => {
  const meta = TYPE_META[type];
  return (
    <div
      className={[
        'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
        selected
          ? 'border-cyan-400 bg-white dark:bg-gray-800 shadow-md shadow-cyan-500/10'
          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800',
      ].join(' ')}
    >
      <button onClick={onSelect} className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
        <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={`material-icons-outlined text-xl ${meta.iconColor}`}>{meta.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-0.5">{meta.title}</p>
          <p className="text-[11px] text-gray-400 font-medium">{meta.subtitle}</p>
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
};

const METHOD_ICON: Record<string, string> = { CARD: 'credit_card', UPI: 'account_balance_wallet', OTHER: 'payments' };

const PaymentMethodsScreen: React.FC = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [view, setView] = useState<'list' | 'add'>('list');
  const [type, setType] = useState<MethodType>('CARD');
  const [card, setCard] = useState(BLANK_CARD);
  const [upiId, setUpiId] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [label, setLabel] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const phone = UserService.getPhoneFromSession();
        if (!phone) { setError('Unable to identify your account. Please log in again.'); setLoading(false); return; }

        const user = await UserService.getUserByPhone(phone);
        if (!user?.id) { setError('Unable to identify your account. Please log in again.'); setLoading(false); return; }

        setUserId(user.id);
        setMethods(user.paymentMethods ?? []);
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        setError('Failed to load payment methods. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = () => {
    if (type === 'CARD') return card.number.replace(/\s/g, '').length === 16 && card.expiry.length === 5 && card.name.trim().length > 1;
    if (type === 'UPI') return /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId);
    return otherDetails.trim().length > 1;
  };

  const openAdd = () => {
    setType('CARD');
    setCard(BLANK_CARD);
    setUpiId('');
    setOtherDetails('');
    setLabel('');
    setMakeDefault(methods.length === 0);
    setFormError('');
    setView('add');
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!canSubmit()) { setFormError('Please fill in valid payment details.'); return; }
    if (!userId) { setFormError('Unable to identify your account. Please log in again.'); return; }

    setSubmitting(true);
    try {
      const payload: Omit<PaymentMethod, 'id'> = {
        type,
        label: label.trim() || undefined,
        isDefault: makeDefault,
        ...(type === 'CARD' && {
          cardLast4: card.number.replace(/\s/g, '').slice(-4),
          cardBrand: detectBrand(card.number),
          cardExpiry: card.expiry,
          cardHolderName: card.name.trim(),
        }),
        ...(type === 'UPI' && { upiId: upiId.trim() }),
        ...(type === 'OTHER' && { otherDetails: otherDetails.trim() }),
      };
      const updated = await UserService.addPaymentMethod(userId, payload);
      setMethods(updated.paymentMethods ?? []);
      setView('list');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add payment method. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!userId) return;
    setDeletingId(methodId);
    try {
      const updated = await UserService.removePaymentMethod(userId, methodId);
      setMethods(updated.paymentMethods ?? []);
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Add view ─────────────────────────────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-28">
        <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
            >
              <span className="material-icons-round text-white">arrow_back</span>
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Add Payment Method</h1>
          </div>
        </header>

        <div className="flex-1 px-5 pt-6 space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="material-icons-round text-red-500 text-base">error_outline</span>
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">{formError}</p>
            </div>
          )}

          <div className="space-y-3">
            <TypeCard type="CARD" selected={type === 'CARD'} onSelect={() => setType('CARD')}>
              {type === 'CARD' && (
                <div className="mt-3 space-y-2.5">
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
                  <input
                    type="tel"
                    value={card.expiry}
                    onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all font-mono"
                  />
                  <input
                    type="text"
                    value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                    placeholder="Cardholder name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all uppercase tracking-wider"
                  />
                  <p className="text-[10px] text-gray-400 leading-relaxed px-0.5">
                    For your security we only save the last 4 digits — your full card number and CVV are never stored.
                  </p>
                </div>
              )}
            </TypeCard>

            <TypeCard type="UPI" selected={type === 'UPI'} onSelect={() => setType('UPI')}>
              {type === 'UPI' && (
                <div className="mt-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all font-mono"
                    />
                    {upiId && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 material-icons-round text-lg ${/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId) ? 'text-green-500' : 'text-red-400'}`}>
                        {/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId) ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </TypeCard>

            <TypeCard type="OTHER" selected={type === 'OTHER'} onSelect={() => setType('OTHER')}>
              {type === 'OTHER' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={otherDetails}
                    onChange={e => setOtherDetails(e.target.value)}
                    placeholder="e.g. Paytm Wallet, Net Banking - HDFC"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all"
                  />
                </div>
              )}
            </TypeCard>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nickname (optional)</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Personal Visa"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/30 transition-all"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={e => setMakeDefault(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Set as default payment method</span>
            </label>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-5 py-4 safe-area-inset-bottom shadow-lg">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><span className="material-icons-round text-lg">check_circle</span> Save Payment Method</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      <header className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 rounded-2xl backdrop-blur-md active:scale-90 transition-transform"
          >
            <span className="material-icons-round text-white">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Payment Methods</h1>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-4 h-20 animate-pulse border border-gray-100 dark:border-gray-700" />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && methods.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-gray-300 dark:text-gray-600 text-5xl mb-3">payment</span>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No payment methods saved yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add a card, UPI ID, or other method for faster checkout.</p>
          </div>
        )}

        {!loading && !error && methods.length > 0 && (
          <div className="space-y-3">
            {methods.map(m => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-green-500 text-xl">{METHOD_ICON[m.type] ?? 'payments'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {m.label || (m.type === 'CARD' ? `${m.cardBrand ?? 'Card'} •••• ${m.cardLast4 ?? ''}` : m.type === 'UPI' ? m.upiId : m.otherDetails)}
                    </p>
                    {m.isDefault && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-lg flex-shrink-0">Default</span>
                    )}
                  </div>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">
                    {m.type === 'CARD' ? `Expires ${m.cardExpiry ?? '—'}` : m.type === 'UPI' ? 'UPI' : 'Other'}
                  </p>
                </div>
                <button
                  onClick={() => m.id && handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="p-2 rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === m.id
                    ? <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin block" />
                    : <span className="material-icons-round text-lg">delete_outline</span>}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={openAdd}
          className="w-full mt-2 py-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-icons-round text-lg">add_circle_outline</span>
          Add Payment Method
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodsScreen;
