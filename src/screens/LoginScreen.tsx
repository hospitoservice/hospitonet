import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import hospitonetLogo from '@/src/asset/hospitonetLogo.jpeg';
import { Screen } from '../../types.ts';
import { sendOTP } from '@/src/service/AuthService';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOTP(phone);
      navigate('/verify', { state: { phone, name } });
    } catch (err: any) {
      setError((err as Error).message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* Hero */}
      <div className="relative w-full h-[55%] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-b-[4rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] rotate-45 scale-75" />
          <div className="relative w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.4)]">
            <img
              alt="Hospitonet"
              src={hospitonetLogo}
              style={{ maxWidth: '105%', borderRadius: '15px' }}
            />
          </div>
        </div>

        <p className="relative z-10 text-cyan-100 font-bold tracking-[0.2em] text-[10px] uppercase">
          Empowering Hospitals, Enhancing Care
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 flex flex-col px-8 pt-10 pb-10 bg-white dark:bg-gray-900 rounded-t-[3.5rem] -mt-10 relative z-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Sign in to access your healthcare dashboard</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">person</span>
            </div>
            <input
              className="w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all shadow-sm font-semibold"
              placeholder="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">smartphone</span>
            </div>
            {/* +91 prefix */}
            <span className="absolute inset-y-0 left-11 flex items-center text-gray-500 dark:text-gray-400 font-semibold text-sm pointer-events-none">
              +91
            </span>
            <input
              className="w-full pl-[4.5rem] pr-4 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all shadow-sm font-semibold tracking-wider"
              placeholder="Mobile Number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
              <span className="material-icons-round text-red-500 text-base">error_outline</span>
              <p className="text-red-600 dark:text-red-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Sending OTP…</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <span className="material-icons-round text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Or verify with biometric</p>
          <button type="button" className="mt-4 p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-primary shadow-sm hover:shadow-md transition-all">
            <span className="material-icons-round text-3xl">fingerprint</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;