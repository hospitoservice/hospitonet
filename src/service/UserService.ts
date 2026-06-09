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