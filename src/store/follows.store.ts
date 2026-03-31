import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FollowsState {
  followedIds: string[];
  isFollowing: (professionalId: string) => boolean;
  toggle: (professionalId: string) => void;
}

export const useFollowsStore = create<FollowsState>()(
  persist(
    (set, get) => ({
      followedIds: [],

      isFollowing: (id) => get().followedIds.includes(id),

      toggle: (id) => {
        set((state) => {
          const already = state.followedIds.includes(id);
          return {
            followedIds: already
              ? state.followedIds.filter((x) => x !== id)
              : [...state.followedIds, id],
          };
        });
      },
    }),
    {
      name: 'follows',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
