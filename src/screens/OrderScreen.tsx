// src/screens/OrderScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ORDERS } from '../resources/Order';

const OrderScreen: React.FC = () => {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                {ORDERS.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Order {order.orderNumber}</p>
                                <p className="text-xs text-gray-400">{formatDate(order.date)}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderScreen;