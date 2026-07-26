import UserService, { Favourite, FavouriteType } from './UserService';

export interface FavouriteMedicine {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  image: string;
}

export interface FavouriteHospital {
  id: string;
  name: string;
  location: string;
  rating?: number;
  tags: string[];
  image: string;
}

export interface FavouriteDoctor {
  id: string;
  name: string;
  specialty: string;
  hospital?: string;
  rating?: number;
  image: string;
}

export interface Favourites {
  medicines: FavouriteMedicine[];
  hospitals: FavouriteHospital[];
  doctors: FavouriteDoctor[];
}

const toMedicine = (f: Favourite): FavouriteMedicine => ({
  id: f.refId,
  name: f.name ?? '',
  manufacturer: f.subtitle ?? '',
  price: f.price ?? 0,
  originalPrice: f.originalPrice,
  rating: f.rating,
  reviews: f.reviews,
  image: f.image ?? '',
});

const toHospital = (f: Favourite): FavouriteHospital => ({
  id: f.refId,
  name: f.name ?? '',
  location: f.subtitle ?? '',
  rating: f.rating,
  tags: f.tags ?? [],
  image: f.image ?? '',
});

const toDoctor = (f: Favourite): FavouriteDoctor => ({
  id: f.refId,
  name: f.name ?? '',
  specialty: f.subtitle ?? '',
  hospital: f.hospital,
  rating: f.rating,
  image: f.image ?? '',
});

class FavouritesService {
  /** Fetches the current session user's real favourites, grouped by type. */
  async getFavourites(): Promise<Favourites> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return { medicines: [], hospitals: [], doctors: [] };

    const user = await UserService.getUserByPhone(phone);
    const list = user?.favourites ?? [];

    return {
      medicines: list.filter(f => f.favouriteType === 'MEDICINE').map(toMedicine),
      hospitals: list.filter(f => f.favouriteType === 'HOSPITAL').map(toHospital),
      doctors: list.filter(f => f.favouriteType === 'DOCTOR').map(toDoctor),
    };
  }

  /** Fetches just the set of favourited refIds for one type — cheap way for a listing
   *  screen (medicines/hospitals grid) to know which hearts should render filled. */
  async getFavouriteRefIds(type: FavouriteType): Promise<Set<string>> {
    const phone = UserService.getPhoneFromSession();
    if (!phone) return new Set();
    const user = await UserService.getUserByPhone(phone);
    const list = user?.favourites ?? [];
    return new Set(list.filter(f => f.favouriteType === type).map(f => f.refId));
  }

  async addFavourite(userId: string, favourite: Omit<Favourite, 'id' | 'addedAt'>) {
    return UserService.addFavourite(userId, favourite);
  }

  async removeFavourite(userId: string, type: FavouriteType, refId: string) {
    return UserService.removeFavourite(userId, type, refId);
  }
}

export default new FavouritesService();
