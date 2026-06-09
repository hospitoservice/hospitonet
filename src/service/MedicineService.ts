import { Medicines } from '../resources/Medicines';

export interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
}

const INVENTORY_GRAPHQL_URL = 'http://localhost:8090/graphql';

const GET_ALL_ITEMS_QUERY = `
  query {
    getAllItems {
      id
      itemName
      itemCategory
      itemSupplier
      description
      price
    }
  }
`;

// Maps an inventory Item to the Medicine shape expected by screens
function mapItemToMedicine(item: any): Medicine {
  return {
    id: item.id,
    name: item.itemName,
    manufacturer: item.itemSupplier ?? 'Unknown',
    price: parseFloat(item.price) || 0,
    originalPrice: parseFloat(item.price) * 1.15 || 0,
    rating: 4.0,
    reviews: 0,
    image: 'https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=400',
  };
}

class MedicineService {
  async getMedicines(): Promise<Medicine[]> {
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
      return items.map(mapItemToMedicine);
    } catch (error) {
      console.warn('[MedicineService] API unavailable, using static data:', (error as Error).message);
      return Medicines as Medicine[];
    }
  }
}

export default new MedicineService();
