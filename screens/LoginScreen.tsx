
import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="relative w-full h-[55%] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-b-[4rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full object-cover" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
          </svg>
        </div>
        
        <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-[2rem] rotate-45 scale-75"></div>
          <div className="relative w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.4)]">
             <div className="relative">
                <span className="material-icons-round text-cyan-500 text-6xl">favorite</span>
                <span className="material-icons-round absolute top-1 right-1 text-white bg-cyan-600 rounded-full text-lg border-2 border-white">add</span>
             </div>
          </div>
        </div>

        <h1 className="relative z-10 text-4xl font-black text-white tracking-tighter mb-1">HOSPITONET</h1>
        <p className="relative z-10 text-cyan-100 font-bold tracking-[0.2em] text-[10px] uppercase">Empowering Hospitals, Enhancing Care</p>
      </div>

      <div className="flex-1 flex flex-col px-8 pt-10 bg-white dark:bg-gray-900 rounded-t-[3.5rem] -mt-10 relative z-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Sign in to access your healthcare dashboard</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">person</span>
            </div>
            <input 
              className="w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all shadow-sm font-semibold" 
              placeholder="Full Name" 
              type="text"
              required
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">smartphone</span>
            </div>
            <input 
              className="w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all shadow-sm font-semibold" 
              placeholder="Mobile Number" 
              type="tel"
              required
            />
          </div>
          
          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span>Get Started</span>
              <span className="material-icons-round text-lg">arrow_forward</span>
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
