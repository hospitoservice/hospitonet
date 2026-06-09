import { Hospital } from '../../types.ts';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const FILTER_MAP: Record<string, string> = {
  'Near Me':    'near_me',
  'Top Rated':  'top_rated',
  '24/7 Open':  '24_7',
  'Recommended': 'recommended',
};

class HospitalService {
  private readonly baseUrl: string;

  constructor() {
    // Empty string → relative paths, Vite proxy handles routing (used inside Docker)
    // Non-empty string → direct URL to the service (used in local dev)
    const envUrl: string = (import.meta as any).env?.VITE_HOSPITAL_SERVICE_URL ?? 'http://localhost:8100';
    this.baseUrl = envUrl;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`Hospital service error: ${response.status}`);
    }
    const body: ApiResponse<T> = await response.json();
    if (!body.success) {
      throw new Error(body.message);
    }
    return body.data;
  }

  getHospitals(filter?: string): Promise<Hospital[]> {
    const apiFilter = filter ? FILTER_MAP[filter] : undefined;
    const query = apiFilter && apiFilter !== 'recommended' ? `?filter=${apiFilter}` : '';
    return this.get<Hospital[]>(`/api/hospitals${query}`);
  }

  getHospitalById(id: string): Promise<Hospital> {
    return this.get<Hospital>(`/api/hospitals/${id}`);
  }

  searchHospitals(keyword: string): Promise<Hospital[]> {
    return this.get<Hospital[]>(`/api/hospitals/search?keyword=${encodeURIComponent(keyword)}`);
  }

  getHospitalsByCity(city: string): Promise<Hospital[]> {
    return this.get<Hospital[]>(`/api/hospitals/city/${encodeURIComponent(city)}`);
  }
}

export default new HospitalService();