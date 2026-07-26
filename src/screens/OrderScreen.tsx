// src/screens/OrderScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService, { Order } from '../service/OrderService';

const STATUS_STYLE: Record<string, string> = {
    Delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    Processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    Placed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    Shipped: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
};

function formatDate(dateString: string): string {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const OrderScreen: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        OrderService.getOrders()
            .then(setOrders)
            .catch(() => setError('Failed to load orders. Please try again.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-32">
            <header className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center transition-transform active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <span className="material-icons-round text-primary text-2xl">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">My Orders</h1>
                </div>
            </header>

            <div className="px-6 mt-4 space-y-4">
                {loading && (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="rounded-2xl h-40 bg-white dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-700" />)}
                    </div>
                )}

                {!loading && error && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-center">
                        <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
                        <button onClick={load} className="mt-2 text-xs text-primary font-black uppercase tracking-widest">Retry</button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-center">
                        <span className="material-icons-round text-gray-300 dark:text-gray-700 text-5xl mb-3">shopping_bag</span>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No orders yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Medicines you order will show up here.</p>
                    </div>
                )}

                {!loading && !error && orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order {order.orderNumber}</p>
                                <p className="text-xs text-gray-400">{formatDate(order.orderDate)}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item, i) => (
                                <div key={item.medicineId ?? i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">₹{item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderScreen;
