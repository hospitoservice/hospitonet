import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationService, { Notification } from '../service/NotificationService';
import PushService from '../service/PushService';

const TYPE_STYLE: Record<string, { icon: string; color: string; bgColor: string }> = {
  appointment: { icon: 'calendar_today', color: 'text-blue-500',   bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  complaint:   { icon: 'report',         color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  payment:     { icon: 'payment',        color: 'text-green-500',  bgColor: 'bg-green-50 dark:bg-green-900/20' },
  system:      { icon: 'info',           color: 'text-cyan-500',   bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
};

function styleFor(type: string) {
  return TYPE_STYLE[type] ?? { icon: 'notifications', color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800' };
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    NotificationService.getNotifications()
      .then(setNotifications)
      .catch(() => setError('Failed to load notifications. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();

    setPushSupported(PushService.isSupported());
    PushService.getExistingSubscription().then(sub => setPushEnabled(!!sub));
  }, []);

  const markAsRead = async (notification: Notification) => {
    if (!notification.read) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      NotificationService.markAsRead(notification.id).catch(() => {});
    }
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    NotificationService.markAllAsRead().catch(() => {});
  };

  const handleEnablePush = async () => {
    setPushBusy(true);
    try {
      await PushService.enable();
      setPushEnabled(true);
    } catch (err) {
      console.error('Failed to enable push notifications:', err);
    } finally {
      setPushBusy(false);
    }
  };

  const hasUnread = notifications.some(n => !n.read);

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
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Push opt-in banner */}
        {pushSupported && !pushEnabled && (
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/30 flex items-center gap-3">
            <span className="material-icons-round text-cyan-500">notifications_active</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Enable push notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get notified even when the app is closed.</p>
            </div>
            <button
              onClick={handleEnablePush}
              disabled={pushBusy}
              className="px-3 py-2 rounded-xl bg-cyan-500 text-white text-xs font-black uppercase tracking-wider disabled:opacity-60 active:scale-95 transition-all"
            >
              {pushBusy ? '…' : 'Enable'}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl h-20 bg-white dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800" />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
            <button onClick={load} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-icons-round text-gray-300 dark:text-gray-700 text-5xl mb-3">notifications_none</span>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No notifications yet.</p>
            <p className="text-xs text-gray-400 mt-1">We'll let you know when something needs your attention.</p>
          </div>
        )}

        {/* List */}
        {!loading && !error && notifications.map((notification) => {
          const style = styleFor(notification.type);
          return (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification)}
              className={`p-4 rounded-2xl ${style.bgColor} border border-gray-100 dark:border-gray-800 transition-all duration-200 cursor-pointer ${
                !notification.read ? 'ring-1 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20">
                  <span className={`material-icons-round ${style.color}`}>{style.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationScreen;
