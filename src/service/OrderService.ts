import { ORDERS, Order } from '../resources/Order';
import UserService from './UserService';

const ORDER_API_URL = 'http://localhost:8096/api/orders';

class OrderService {
  async getOrders(): Promise<Order[]> {
    try {
      const phone = UserService.getPhoneFromSession();
      const url = phone ? `${ORDER_API_URL}/user/${phone}` : ORDER_API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Order[] = await res.json();
      if (!data.length) throw new Error('Empty response');
      return data;
    } catch (error) {
      console.warn('[OrderService] API unavailable, using static data:', (error as Error).message);
      return ORDERS as unknown as Order[];
    }
  }
}

export default new OrderService();
