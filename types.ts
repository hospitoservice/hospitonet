
export enum Screen {
  LOGIN = 'login',
  HOME = 'home',
  HOSPITALS = 'hospitals',
  RECORDS = 'records',
  MEDICINES = 'medicines',
  PROFILE = 'profile',
  FAVOURITES = 'favourites',
  ASSISTANT = 'assistant',
  NOTIFICATIONS = 'notifications'
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  image: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  tags: string[];
  consultationFee: number;
  image: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  image: string;
  prescription: string[];
}

export interface RecordItem {
  id: string;
  title: string;
  location: string;
  date: string;
  status?: string;
  type: 'lab' | 'consultation' | 'vaccination' | 'order';
}

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  image: string;
}
