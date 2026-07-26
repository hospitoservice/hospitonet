import NotificationService from './NotificationService';

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

class PushService {
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) return null;
    return registration.pushManager.getSubscription();
  }

  /** Registers the service worker (idempotent), requests permission, and subscribes to push. */
  async enable(): Promise<PushSubscription> {
    if (!this.isSupported()) throw new Error('Push notifications are not supported in this browser.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission was not granted.');

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await NotificationService.subscribePush(existing);
      return existing;
    }

    const publicKey = await NotificationService.getVapidPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await NotificationService.subscribePush(subscription);
    return subscription;
  }

  async disable(): Promise<void> {
    const subscription = await this.getExistingSubscription();
    if (!subscription) return;
    await NotificationService.unsubscribePush(subscription.endpoint);
    await subscription.unsubscribe();
  }
}

export default new PushService();
