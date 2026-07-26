import UserService from './UserService';

export interface OrderItem {
  medicineId?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface DeliveryAddress {
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMode?: string;
  paymentStatus?: string;
  deliveryAddress?: DeliveryAddress;
  orderDate: string;
}

export interface CreateOrderRequest {
  userId?: string;
  userPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMode: string;
  deliveryAddress?: DeliveryAddress;
}

const BASE_URL = '/api/orders';

class OrderService {
  /** Fetches the current session user's orders — by userId first, falling back to phone. */
  async getOrders(): Promise<Order[]> {
    const userId = UserService.getUserIdFromSession();
    const phone = UserService.getPhoneFromSession();

    try {
      if (userId) {
        const res = await fetch(`${BASE_URL}/user/${userId}`);
        if (res.ok) {
          const data: Order[] = await res.json();
          if (data.length > 0) return data;
        }
      }
      if (phone) {
        const res = await fetch(`${BASE_URL}/phone/${phone}`);
        if (res.ok) return await res.json();
      }
      return [];
    } catch (error) {
      console.warn('[OrderService] Failed to fetch orders:', (error as Error).message);
      return [];
    }
  }

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
    return res.json();
  }

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
    return res.json();
  }

  async cancelOrder(id: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/${id}/cancel`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`Failed to cancel order: ${res.status}`);
    return res.json();
  }
}

export default new OrderService();
