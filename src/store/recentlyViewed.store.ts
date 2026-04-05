import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX = 10;

interface RecentlyViewedState {
  ids: string[];
  record: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      record: (id) => {
        const filtered = get().ids.filter((x) => x !== id);
        set({ ids: [id, ...filtered].slice(0, MAX) });
      },
    }),
    {
      name: 'recently-viewed-announcements',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
