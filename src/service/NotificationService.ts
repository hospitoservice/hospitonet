import UserService from './UserService';

export interface Notification {
  id: string;
  phone: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const BASE_URL = '/api/notifications';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return [];
    const res = await fetch(`${BASE_URL}/phone/${phone}`);
    if (!res.ok) throw new Error(`NotificationService: HTTP ${res.status}`);
    return res.json();
  }

  async getUnreadCount(): Promise<number> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return 0;
    const res = await fetch(`${BASE_URL}/phone/${phone}/unread-count`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count ?? 0;
  }

  async markAsRead(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`NotificationService: HTTP ${res.status}`);
  }

  async markAllAsRead(): Promise<void> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return;
    const res = await fetch(`${BASE_URL}/phone/${phone}/read-all`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`NotificationService: HTTP ${res.status}`);
  }

  async getVapidPublicKey(): Promise<string> {
    const res = await fetch(`${BASE_URL}/vapid-public-key`);
    if (!res.ok) throw new Error(`NotificationService: HTTP ${res.status}`);
    const data = await res.json();
    return data.publicKey;
  }

  async subscribePush(subscription: globalThis.PushSubscription): Promise<void> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return;
    const json = subscription.toJSON();
    const res = await fetch(`${BASE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    });
    if (!res.ok) throw new Error(`NotificationService: HTTP ${res.status}`);
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    await fetch(`${BASE_URL}/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
  }
}

export default new NotificationService();
