
import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import HospitalsScreen from './screens/HospitalsScreen';
import RecordsScreen from './screens/RecordsScreen';
import MedicinesScreen from './screens/MedicinesScreen';
import AssistantScreen from './screens/AssistantScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOGIN:
        return <LoginScreen onLogin={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.HOME:
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
      case Screen.HOSPITALS:
        return <HospitalsScreen />;
      case Screen.RECORDS:
        return <RecordsScreen />;
      case Screen.MEDICINES:
        return <MedicinesScreen />;
      case Screen.PROFILE:
        return <ProfileScreen onLogout={() => setCurrentScreen(Screen.LOGIN)} />;
      case Screen.ASSISTANT:
        return <AssistantScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      default:
        return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  const showNav = currentScreen !== Screen.LOGIN && currentScreen !== Screen.ASSISTANT;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 dark:bg-gray-900 shadow-2xl relative flex flex-col transition-colors duration-200">
      {/* Mock Status Bar */}
      <div className="h-10 w-full flex items-center justify-between px-6 pt-2 z-50 bg-transparent absolute top-0 pointer-events-none">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">9:41</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-white rounded-full opacity-20"></div>
          <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-white rounded-full opacity-20"></div>
          <div className="w-1.5 h-1.5 bg-gray-900 dark:bg-white rounded-full"></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {renderScreen()}
      </main>

      {showNav && (
        <BottomNav 
          activeScreen={currentScreen} 
          onNavigate={(screen) => setCurrentScreen(screen)} 
          onOpenAssistant={() => setCurrentScreen(Screen.ASSISTANT)}
        />
      )}

      {/* Dark Mode Toggle */}
      {currentScreen !== Screen.LOGIN && (
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed bottom-28 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg z-[60] border border-gray-100 dark:border-gray-700 transition-transform active:scale-90"
        >
          <span className="material-icons-round text-primary block dark:hidden">dark_mode</span>
          <span className="material-icons-round text-yellow-400 hidden dark:block">light_mode</span>
        </button>
      )}

      <style>{`
        :root {
          --primary-color: #06b6d4; /* Cyan 500 */
          --primary-dark: #0891b2; /* Cyan 600 */
        }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .ring-primary { --tw-ring-color: var(--primary-color); }
        .from-primary { --tw-gradient-from: var(--primary-color) var(--tw-gradient-from-position); }
        .to-primary { --tw-gradient-to: var(--primary-dark) var(--tw-gradient-to-position); }
      `}</style>
    </div>
  );
};

export default App;
