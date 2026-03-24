import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoritedIds: string[];
  isFavorited: (id: string) => boolean;
  toggle: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoritedIds: [],

      isFavorited: (id) => get().favoritedIds.includes(id),

      toggle: (id) => {
        set((state) => {
          const already = state.favoritedIds.includes(id);
          return {
            favoritedIds: already
              ? state.favoritedIds.filter((x) => x !== id)
              : [...state.favoritedIds, id],
          };
        });
      },
    }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
