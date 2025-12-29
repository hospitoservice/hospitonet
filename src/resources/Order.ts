// src/resources/orders.ts
export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: 'Delivered' | 'Processing' | 'Cancelled' | 'Shipped';
    total: number;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        image: string;
    }[];
}

export const ORDERS = [
    {
        id: '1',
        orderNumber: '#ORD-2023-001',
        date: '2023-12-15',
        status: 'Delivered',
        total: 1245,
        items: [
            {
                id: '101',
                name: 'Paracetamol 500mg',
                quantity: 2,
                price: 25,
                image: 'https://picsum.photos/seed/med1/100/100'
            },
            {
                id: '102',
                name: 'Vitamin C 1000mg',
                quantity: 1,
                price: 199,
                image: 'https://picsum.photos/seed/med2/100/100'
            }
        ]
    },
    {
        id: '2',
        orderNumber: '#ORD-2023-002',
        date: '2023-12-20',
        status: 'Processing',
        total: 567,
        items: [
            {
                id: '103',
                name: 'Azithromycin 250mg',
                quantity: 1,
                price: 150,
                image: 'https://picsum.photos/seed/med3/100/100'
            }
        ]
    }
] as const;