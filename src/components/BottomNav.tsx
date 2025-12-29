
import React from 'react';
import { Screen } from '../../types.ts';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onOpenAssistant: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, onOpenAssistant }) => {
  const navItems = [
    { screen: Screen.HOME, icon: 'home' },
    { screen: Screen.RECORDS, icon: 'description' },
    { screen: Screen.MEDICINES, icon: 'shopping_bag' },
    { screen: Screen.PROFILE, icon: 'person' },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activeScreen === item.screen;
    return (
      <button
        onClick={() => onNavigate(item.screen)}
        className="flex-1 flex flex-col items-center justify-center py-5 relative outline-none group"
      >
        <div className={`
          flex flex-col items-center transition-all duration-300
          ${isActive ? 'scale-110' : 'scale-100'}
        `}>
          {/* Active Pill Background */}
          <div className={`
            absolute inset-x-1 inset-y-2 rounded-2xl transition-all duration-300
            ${isActive ? 'bg-primary/10 dark:bg-primary/20 opacity-100' : 'bg-transparent opacity-0'}
          `} />
          
          <span className={`
            material-icons-round text-[28px] z-10 transition-colors
            ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}
          `}>
            {item.icon}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[200]">
      {/* Subtle top shadow gradient */}
      <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-gray-50/80 dark:from-gray-900/80 to-transparent pointer-events-none"></div>
      
      <nav className="
        flex items-center justify-between px-2 py-1 mb-6 mx-4
        bg-white dark:bg-gray-800 shadow-[0_-8px_30px_rgb(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.2)]
        border border-gray-100 dark:border-gray-700
        rounded-[2.5rem] relative
      ">
        {/* Left Side */}
        <div className="flex flex-1 items-center justify-around pr-2">
          <NavButton item={navItems[0]} />
          <NavButton item={navItems[1]} />
        </div>

        {/* Center Assistant Button */}
        <div className="relative -top-6 px-2">
          <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse"></div>
          <button 
            onClick={onOpenAssistant}
            className="
              relative w-16 h-16 
              bg-gradient-to-br from-cyan-400 to-blue-600
              rounded-full shadow-2xl shadow-cyan-500/40 
              flex items-center justify-center text-white 
              transition-all duration-500
              active:scale-90 hover:shadow-cyan-500/60
              border-4 border-white dark:border-gray-800
              z-10
            "
          >
            <span className="material-icons-round text-3xl">bolt</span>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-around pl-2">
          <NavButton item={navItems[2]} />
          <NavButton item={navItems[3]} />
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
