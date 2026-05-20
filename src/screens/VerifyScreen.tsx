
import React, { useState, useRef, useEffect } from 'react';
import { Screen } from '../../types.ts';

interface VerifyScreenProps {
  onNavigate: (screen: Screen) => void;
}

const OTP_LENGTH = 6;

const VerifyScreen: React.FC<VerifyScreenProps> = ({ onNavigate }) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [shaking, setShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
    e.preventDefault();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === OTP_LENGTH) {
      onNavigate(Screen.HOME);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900">

      {/* Header */}
      <div className="relative flex flex-col items-center justify-end pb-10 pt-16 px-6"
        style={{ background: 'linear-gradient(160deg, #06b6d4 0%, #2563eb 100%)', borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem', minHeight: '38vh' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-16 -translate-y-16 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-300/20 rounded-full translate-x-10 translate-y-10 blur-2xl pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => onNavigate(Screen.LOGIN)}
          className="absolute top-12 left-5 flex items-center gap-1 text-white/80 hover:text-white transition-colors group"
          aria-label="Back to Login"
        >
          <span className="material-icons-round text-xl group-hover:-translate-x-0.5 transition-transform">arrow_back_ios</span>
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>

        {/* Icon */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] rotate-12 scale-110 blur-sm" />
          <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-[0_8px_40px_rgba(255,255,255,0.35)]">
            <span className="material-icons-round text-cyan-500 text-4xl">verified_user</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">OTP Verification</h1>
        <p className="mt-2 text-cyan-100 text-sm font-medium text-center max-w-xs leading-relaxed">
          Enter the 6-digit code sent to your registered mobile number
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-5">
          {Array(OTP_LENGTH).fill(null).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: i < filled ? '1.5rem' : '0.375rem', background: i < filled ? 'white' : 'rgba(255,255,255,0.35)' }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-6 pt-10 pb-8">

        <form onSubmit={handleVerify} className="flex flex-col flex-1">

          {/* OTP Boxes */}
          <div
            className={`flex justify-center gap-3 ${shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
            style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
          >
            {otp.map((digit, i) => (
              <div key={i} className="relative">
                <input
                  ref={el => { inputRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={[
                    'w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all duration-200',
                    'bg-gray-800 text-white caret-cyan-400',
                    digit
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_16px_rgba(34,211,238,0.3)] scale-105'
                      : 'border-gray-700 focus:border-cyan-500 focus:bg-gray-700/60',
                  ].join(' ')}
                />
                {digit && (
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-cyan-400/30 pointer-events-none" />
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 text-xs mt-4 font-medium">
            {filled === 0
              ? 'Tap a box to start entering the code'
              : filled < OTP_LENGTH
              ? `${OTP_LENGTH - filled} digit${OTP_LENGTH - filled > 1 ? 's' : ''} remaining`
              : 'All digits entered — tap Verify'}
          </p>

          {/* Resend */}
          <div className="mt-8 flex flex-col items-center gap-1">
            <p className="text-gray-500 text-xs font-medium">Didn't receive the code?</p>
            <button
              type="button"
              className="text-cyan-400 font-bold text-xs uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span className="material-icons-round text-sm">refresh</span>
              Resend OTP
            </button>
          </div>

          <div className="flex-1" />

          {/* Verify Button */}
          <button
            type="submit"
            disabled={filled < OTP_LENGTH}
            className={[
              'w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300',
              'flex items-center justify-center gap-3',
              filled === OTP_LENGTH
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-[0.98]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed',
            ].join(' ')}
          >
            <span className="material-icons-round text-xl">check_circle</span>
            Verify & Continue
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          35% { transform: translateX(6px); }
          55% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default VerifyScreen;