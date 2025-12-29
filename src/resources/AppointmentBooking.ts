// src/resources/AppointmentBooking.ts
export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    experience: number;
    rating: number;
    image: string;
    availableSlots: string[];
}

export interface Department {
    id: string;
    name: string;
    doctors: string[]; // Array of doctor IDs
}

export const DEPARTMENTS: Department[] = [
    { id: 'cardio', name: 'Cardiology', doctors: ['doc1', 'doc2'] },
    { id: 'neuro', name: 'Neurology', doctors: ['doc3'] },
    { id: 'ortho', name: 'Orthopedics', doctors: ['doc4', 'doc5'] },
    { id: 'ped', name: 'Pediatrics', doctors: ['doc6'] },
    { id: 'derm', name: 'Dermatology', doctors: ['doc7'] },
];

export const DOCTORS: Record<string, Doctor> = {
    doc1: {
        id: 'doc1',
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cardiologist',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc2: {
        id: 'doc2',
        name: 'Dr. Narendra Shah',
        specialization: 'Cardiologist',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc3: {
        id: 'doc3',
        name: 'Dr. Ravi Verma',
        specialization: 'Neurology',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc4: {
        id: 'doc4',
        name: 'Dr. Pankaj Singh',
        specialization: 'Orthopedics',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc5: {
        id: 'doc5',
        name: 'Dr. Prakash Dixit ',
        specialization: 'Orthopedics',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc6: {
        id: 'doc6',
        name: 'Dr. Subham Saran',
        specialization: 'Pediatrics',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    },
    doc7: {
        id: 'doc7',
        name: 'Dr. Amarnath Kumar',
        specialization: 'Dermatology',
        experience: 12,
        rating: 4.8,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    }
    // Add more doctors as needed
};

export const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];