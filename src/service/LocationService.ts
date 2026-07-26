import { LOCATIONS } from '../resources/Location';

const HOSPITAL_API_URL = 'http://localhost:8100/api/hospitals';

class LocationService {
  async getLocations(): Promise<string[]> {
    try {
      const res = await fetch(HOSPITAL_API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const hospitals: any[] = await res.json();
      if (!hospitals.length) throw new Error('Empty response');
      const cities = hospitals
        .map(h => h.city ?? h.address?.city ?? '')
        .filter(Boolean);
      const unique = [...new Set<string>(cities)];
      if (!unique.length) throw new Error('No cities in response');
      return unique;
    } catch (error) {
      console.warn('[LocationService] API unavailable, using static data:', (error as Error).message);
      return LOCATIONS as string[];
    }
  }
}

export default new LocationService();