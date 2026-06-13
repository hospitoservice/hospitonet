
export enum Screen {
  LOGIN = 'login',
  VERIFY = 'verify',
  HOME = 'home',
  HOSPITALS = 'hospitals',
  RECORDS = 'records',
  MEDICINES = 'medicines',
  PROFILE = 'profile',
  FAVOURITES = 'favourites',
  ASSISTANT = 'assistant',
  NOTIFICATIONS = 'notifications',
  LABTESTS = 'lab-tests',
  CHECKOUT = 'checkout'
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
  hospitalId?: string;
  name: string;
  location: string;
  city?: string;
  distance: string;
  rating: number;
  tags: string[];
  consultationFee: number;
  image: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
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

// ── Full appointment shape returned by appointment-service ─────────────────────

export interface AppointmentVitals {
  height?: string;
  weight?: string;
  bmi?: string;
  temperature?: string;
  heartRate?: string;
  spo2?: string;
  bloodGroup?: string;
  bloodPressure?: string;
  condition?: string;
}

export interface AppointmentSymptoms {
  fever?: boolean;
  cough?: boolean;
  headache?: boolean;
  fatigue?: boolean;
  jointPain?: boolean;
  chestPain?: boolean;
  bodyPain?: boolean;
  abdominalPain?: boolean;
  hairloss?: boolean;
  breathingProblem?: boolean;
  nightSweats?: boolean;
  infection?: boolean;
  vomiting?: boolean;
  diarrhea?: boolean;
  constipation?: boolean;
  dizziness?: boolean;
  skinrash?: boolean;
  nausea?: boolean;
  otherSymptoms?: string;
}

export interface AppointmentMedicine {
  id?: string;
  medicineName?: string;
  medicineCategory?: string;
  medicineDosage?: string;
  medicineFrequency?: string;
  medicineDuration?: string;
  store?: string;
  description?: string;
  price?: string;
  expiryDate?: string;
}

export interface AppointmentTestReport {
  id?: string;
  testId?: string;
  testName?: string;
  testCategory?: string;
  testStatus?: string;
  testAssignedDate?: string;
  testPerformedDate?: string;
  reportId?: string;
  reportName?: string;
  report?: string;
  reportDate?: string;
}

export interface AppointmentPayment {
  paymentId?: string;
  paymentMode?: string;
  paymentAmount?: string;
  paymentSuccessful?: boolean;
}

export interface AppointmentHospitalInfo {
  hospitalId?: string;
  hospitalName?: string;
  hospitalBranchName?: string;
  hospitalLocation?: { address?: string; city?: string; state?: string; pincode?: string };
}

export interface BookedAppointment {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender?: string;
  patientMobile?: string;
  patientEmail?: string;
  patientDOB?: string;
  department: string;
  doctor?: string;
  doctorFees?: number;
  shift?: string;
  appointmentDate: string;
  slot: string;
  appointmentPriority?: string;
  paymentMode?: string;
  status: string;
  message?: string;
  liveConsultant?: string;
  vitals?: AppointmentVitals;
  symptoms?: AppointmentSymptoms;
  doctorComments?: string;
  medicine?: AppointmentMedicine[];
  testsAndReports?: AppointmentTestReport[];
  paymentInformation?: AppointmentPayment[];
  hospital?: AppointmentHospitalInfo;
}

// ─────────────────────────────────────────────────────────────────────────────

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
