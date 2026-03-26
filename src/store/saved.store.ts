import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedState {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],

      isSaved: (id) => get().savedIds.includes(id),

      toggle: (id) => {
        set((state) => {
          const already = state.savedIds.includes(id);
          return {
            savedIds: already
              ? state.savedIds.filter((x) => x !== id)
              : [...state.savedIds, id],
          };
        });
      },
    }),
    {
      name: 'saved-announcements',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
