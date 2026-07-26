export interface UserLocation {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ImmediateContact {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  relation?: string;
}

export interface MedicalHistory {
  issueName?: string;
  issueDiagnosedDate?: string;
  currentlyActive?: boolean;
}

export interface InsuranceInformation {
  insuranceId?: string;
  insuranceCompanyName?: string;
  insuranceName?: string;
  insuranceAmount?: number;
}

export interface PaymentMethod {
  id?: string;
  type: 'CARD' | 'UPI' | 'OTHER';
  label?: string;
  cardLast4?: string;
  cardBrand?: string;
  cardExpiry?: string;
  cardHolderName?: string;
  upiId?: string;
  otherDetails?: string;
  isDefault?: boolean;
}

export type FavouriteType = 'MEDICINE' | 'DOCTOR' | 'HOSPITAL';

export interface Favourite {
  id?: string;
  favouriteType: FavouriteType;
  refId: string;
  name?: string;
  image?: string;
  subtitle?: string;
  rating?: number;
  price?: number;
  originalPrice?: number;
  reviews?: number;
  hospital?: string;
  tags?: string[];
  addedAt?: string;
}

export interface PatientLink {
  hospitalId: string;
  hospitalName?: string;
  patientId: string;
  linkedAt?: string;
}

export interface InsurancePolicy {
  id?: string;
  planId?: string;
  provider: string;
  planName: string;
  type: 'Health' | 'Life' | 'Accident' | 'Travel';
  policyNumber?: string;
  coverageAmount: number;
  premium: number;
  status: 'Active' | 'Pending' | 'Expired';
  startDate?: string;
  endDate?: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  patientId?: string;
  healthCardNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  aadhar?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  bmi?: string;
  allergies?: string;
  additionalComments?: string;
  imageUrl?: string;
  location?: UserLocation;
  immediateContact?: ImmediateContact;
  medicalHistoryList?: MedicalHistory[];
  insuranceInformation?: InsuranceInformation;
  appointmentIdList?: string[];
  paymentMethods?: PaymentMethod[];
  favourites?: Favourite[];
  patientLinks?: PatientLink[];
  insurancePolicies?: InsurancePolicy[];
}

const BASE_URL = '/api/users';

class UserService {
  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    const res = await fetch(`${BASE_URL}/phone/${phone}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
    return res.json();
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
    return res.json();
  }

  async createUser(user: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
    return res.json();
  }

  async updateUser(id: string, user: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
    return res.json();
  }

  async linkPatient(id: string, patientId: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/link-patient`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error(`Failed to link patient: ${res.status}`);
    return res.json();
  }

  /** Upserts the patient-service link for one hospital — patient records are scoped
   *  per hospital, so a user can have several of these, unlike the single legacy `patientId`. */
  async linkPatientForHospital(id: string, link: Omit<PatientLink, 'linkedAt'>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/patient-links`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    if (!res.ok) throw new Error(`Failed to link patient for hospital: ${res.status}`);
    return res.json();
  }

  async addPaymentMethod(id: string, paymentMethod: Omit<PaymentMethod, 'id'>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentMethod),
    });
    if (!res.ok) throw new Error(`Failed to add payment method: ${res.status}`);
    return res.json();
  }

  async removePaymentMethod(id: string, paymentMethodId: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to remove payment method: ${res.status}`);
    return res.json();
  }

  async addFavourite(id: string, favourite: Omit<Favourite, 'id' | 'addedAt'>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/favourites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favourite),
    });
    if (!res.ok) throw new Error(`Failed to add favourite: ${res.status}`);
    return res.json();
  }

  async removeFavourite(id: string, favouriteType: FavouriteType, refId: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/favourites/${favouriteType}/${encodeURIComponent(refId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to remove favourite: ${res.status}`);
    return res.json();
  }

  async addInsurancePolicy(id: string, policy: Omit<InsurancePolicy, 'id'>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/insurance-policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    if (!res.ok) throw new Error(`Failed to add insurance policy: ${res.status}`);
    return res.json();
  }

  async removeInsurancePolicy(id: string, policyId: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/${id}/insurance-policies/${policyId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to remove insurance policy: ${res.status}`);
    return res.json();
  }

  savePhoneToSession(phone: string): void {
    localStorage.setItem('hospitonet_user_phone', phone);
  }

  getPhoneFromSession(): string | null {
    return localStorage.getItem('hospitonet_user_phone');
  }

  saveUserIdToSession(id: string): void {
    localStorage.setItem('hospitonet_user_id', id);
  }

  getUserIdFromSession(): string | null {
    return localStorage.getItem('hospitonet_user_id');
  }

  clearSession(): void {
    localStorage.removeItem('hospitonet_user_phone');
    localStorage.removeItem('hospitonet_user_id');
  }
}

export default new UserService();