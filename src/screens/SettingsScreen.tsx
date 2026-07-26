import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeService, { Theme } from '../service/ThemeService';

const THEME_OPTIONS: { value: Theme; label: string; subtitle: string; icon: string }[] = [
  { value: 'light', label: 'Light Mode', subtitle: 'Bright background, dark text', icon: 'light_mode' },
  { value: 'dark',  label: 'Dark Mode',  subtitle: 'Dark background, easy on the eyes', icon: 'dark_mode' },
];

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(ThemeService.getTheme());

  const selectTheme = (value: Theme) => {
    ThemeService.setTheme(value);
    setTheme(value);
  };

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
          <h1 className="text-xl font-black text-white tracking-tight">App Settings</h1>
        </div>
      </header>

      <div className="px-5 pt-6 space-y-3">
        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">Theme</h2>

        <div className="space-y-3">
          {THEME_OPTIONS.map(opt => {
            const selected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectTheme(opt.value)}
                className={[
                  'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-200',
                  selected
                    ? 'border-cyan-400 bg-white dark:bg-gray-800 shadow-md shadow-cyan-500/10'
                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800',
                ].join(' ')}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.value === 'dark' ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
                  <span className={`material-icons-round text-xl ${opt.value === 'dark' ? 'text-indigo-500' : 'text-amber-500'}`}>{opt.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-0.5">{opt.label}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{opt.subtitle}</p>
                </div>
                <div className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                  selected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300 dark:border-gray-600',
                ].join(' ')}>
                  {selected && <span className="material-icons-round text-white text-xs">check</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
