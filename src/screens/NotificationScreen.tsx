import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NOTIFICATIONS from '../resources/notifications';

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/30 dark:border-gray-700 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <span className="material-icons-round text-gray-800 dark:text-white">arrow_back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          </div>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            className={`p-4 rounded-2xl ${notification.bgColor} border border-gray-100 dark:border-gray-800 transition-all duration-200 ${
              !notification.read ? 'ring-1 ring-primary/20' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${notification.bgColor.replace('bg-', 'bg-').replace('/30', '/20')}`}>
                <span className={`material-icons-round ${notification.color}`}>
                  {notification.icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationScreen;
