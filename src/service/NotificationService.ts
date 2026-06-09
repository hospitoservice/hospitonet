import NOTIFICATIONS from '../resources/notifications';
import UserService from './UserService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  bgColor: string;
}

const USER_API_URL = 'http://localhost:8085/api/users';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const phone = UserService.getPhoneFromSession();
      if (!phone) throw new Error('No session');
      const res = await fetch(`${USER_API_URL}/${phone}/notifications`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Notification[] = await res.json();
      if (!data.length) throw new Error('Empty response');
      return data;
    } catch (error) {
      console.warn('[NotificationService] API unavailable, using static data:', (error as Error).message);
      return NOTIFICATIONS as Notification[];
    }
  }
}

export default new NotificationService();