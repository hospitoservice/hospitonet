export enum Screen {
  LOGIN = 'login',
  HOME = 'home',
  PROFILE = 'profile',
  MEDICINES = 'medicines',
  RECORDS = 'records',
  HOSPITALS = 'hospitals',
  FAVOURITES = 'favourites'
}

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  discount?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: string;
  image: string;
  prescription?: string[]; // Array of prescription image URLs
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  image: string;
  appointmentId?: string;
  isUploaded?: boolean; // To differentiate between uploaded and appointment prescriptions
}
