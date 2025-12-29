
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Screen } from './types';

// Import all screens
import HomeScreen from '@/src/screens/HomeScreen';
import FavouritesScreen from '@/src/screens/FavouritesScreen';
import ProfileScreen from '@/src/screens/ProfileScreen';
import MedicinesScreen from '@/src/screens/MedicinesScreen';
import HospitalsScreen from '@/src/screens/HospitalsScreen';
import RecordsScreen from '@/src/screens/RecordsScreen';
import AssistantScreen from '@/src/screens/AssistantScreen';
import LoginScreen from '@/src/screens/LoginScreen';
import BottomNav from '@/src/components/BottomNav';
import NotificationScreen from "@/src/screens/NotificationScreen.tsx";
import OrderScreen from "@/src/screens/OrderScreen.tsx";
import LabtestScreen from "@/src/screens/LabtestScreen.tsx";
import AppointmentBookingScreen from "@/src/screens/AppointmentBookingScreen.tsx";

const AppContent: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current screen from path
  const getCurrentScreen = (): Screen => {
    const path = location.pathname.substring(1);
    if (path === '') return Screen.HOME;
    return Object.values(Screen).find(screen => 
      screen.toLowerCase() === path.toLowerCase()
    ) as Screen || Screen.HOME;
  };

  const currentScreen = getCurrentScreen();
  const showNav = currentScreen !== Screen.LOGIN && currentScreen !== Screen.ASSISTANT;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNavigate = (screen: Screen) => {
    navigate(screen === Screen.HOME ? '/' : `/${screen.toLowerCase()}`);
  };

  return (
    <>
      {/* Mock Status Bar */}
      <div className="h-10 w-full flex items-center justify-between px-6 pt-2 z-50 bg-transparent absolute top-0 pointer-events-none">
      </div>

      <main className="flex-1 overflow-y-auto hide-scrollbar pt-0">
        <Routes>
          <Route path="/" element={<HomeScreen onNavigate={handleNavigate} />} />
          <Route path="/favourites" element={<FavouritesScreen />} />
          <Route path="/notifications" element={<NotificationScreen />} />
          <Route path="/profile" element={<ProfileScreen onLogout={() => handleNavigate(Screen.LOGIN)} />} />
          <Route path="/medicines" element={<MedicinesScreen />} />
          <Route path="/hospitals" element={<HospitalsScreen />} />
          <Route path="/records" element={<RecordsScreen />} />
          <Route path="/assistant" element={<AssistantScreen onBack={() => handleNavigate(Screen.HOME)} />} />
          <Route path="/login" element={<LoginScreen onLogin={() => handleNavigate(Screen.HOME)} />} />
          <Route path="/orders" element={<OrderScreen />} />
          <Route path="/lab-tests" element={<LabtestScreen />} />
          <Route path="/book-appointment" element={<AppointmentBookingScreen />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
                <button
                  onClick={() => handleNavigate(Screen.HOME)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {showNav && (
        <BottomNav 
          activeScreen={currentScreen} 
          onNavigate={handleNavigate}
          onOpenAssistant={() => handleNavigate(Screen.ASSISTANT)}
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
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
