import { FAVOURITES } from '../resources/Favourites';

const HOSPITAL_API_URL = 'http://localhost:8100/api/hospitals';
const INVENTORY_GRAPHQL_URL = 'http://localhost:8090/graphql';

const GET_ALL_ITEMS_QUERY = `
  query {
    getAllItems {
      id
      itemName
      itemSupplier
      price
    }
  }
`;

export interface FavouriteMedicine {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
}

export interface FavouriteHospital {
  id: string;
  name: string;
  location: string;
  rating: number;
  tags: string[];
  image: string;
}

export interface FavouriteDoctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  image: string;
}

export interface Favourites {
  medicines: FavouriteMedicine[];
  hospitals: FavouriteHospital[];
  doctors: FavouriteDoctor[];
}

class FavouritesService {
  async getFavourites(): Promise<Favourites> {
    const [medicines, hospitals] = await Promise.all([
      this.fetchMedicines(),
      this.fetchHospitals(),
    ]);
    return {
      medicines,
      hospitals,
      doctors: FAVOURITES.doctors as FavouriteDoctor[],
    };
  }

  private async fetchMedicines(): Promise<FavouriteMedicine[]> {
    try {
      const res = await fetch(INVENTORY_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_ALL_ITEMS_QUERY }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      const items: any[] = json.data?.getAllItems ?? [];
      if (!items.length) throw new Error('Empty response');
      return items.slice(0, 4).map(item => ({
        id: item.id,
        name: item.itemName,
        manufacturer: item.itemSupplier ?? 'Unknown',
        price: parseFloat(item.price) || 0,
        originalPrice: parseFloat(item.price) * 1.15 || 0,
        rating: 4.0,
        reviews: 0,
        image: 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=400',
      }));
    } catch (error) {
      console.warn('[FavouritesService] Medicines API unavailable, using static data:', (error as Error).message);
      return FAVOURITES.medicines as FavouriteMedicine[];
    }
  }

  private async fetchHospitals(): Promise<FavouriteHospital[]> {
    try {
      const res = await fetch(`${HOSPITAL_API_URL}/top-rated`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any[] = await res.json();
      if (!data.length) throw new Error('Empty response');
      return data.slice(0, 3).map(h => ({
        id: h.id,
        name: h.name,
        location: h.address ?? h.city ?? '',
        rating: h.rating ?? 4.0,
        tags: h.tags ?? (h.type ? [h.type] : ['Hospital']),
        image: h.imageUrl ?? 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=400',
      }));
    } catch (error) {
      console.warn('[FavouritesService] Hospitals API unavailable, using static data:', (error as Error).message);
      return FAVOURITES.hospitals as unknown as FavouriteHospital[];
    }
  }
}

export default new FavouritesService();