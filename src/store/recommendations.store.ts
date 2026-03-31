import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnnouncementType } from '@app-types/announcement';

// ── Signal weights ─────────────────────────────────────────────────────────────
// How much each action bumps interest in a type

const SIGNAL_WEIGHTS = {
  save: 3,
  participate: 5,
  open: 1,
} as const;

export type SignalKind = keyof typeof SIGNAL_WEIGHTS;

// ── Thresholds ─────────────────────────────────────────────────────────────────
// Below COLD_START → pure diversity. Above WARM → fully personalized.
// In between → gradual blend.

export const COLD_START_THRESHOLD = 8;
export const WARM_THRESHOLD = 25;

// ── Store ──────────────────────────────────────────────────────────────────────

interface RecommendationsState {
  /** Accumulated interest score per announcement type */
  typeScores: Partial<Record<AnnouncementType, number>>;
  /** Total signals recorded (drives cold-start → warm transition) */
  signalCount: number;
  /** Open count per announcement ID — used for trending */
  openCounts: Record<string, number>;

  recordSignal: (type: AnnouncementType, kind: SignalKind) => void;
  recordOpen: (announcementId: string) => void;
}

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set) => ({
      typeScores: {},
      signalCount: 0,
      openCounts: {},

      recordSignal: (type, kind) => {
        const weight = SIGNAL_WEIGHTS[kind];
        set((s) => ({
          typeScores: {
            ...s.typeScores,
            [type]: (s.typeScores[type] ?? 0) + weight,
          },
          signalCount: s.signalCount + 1,
        }));
      },

      recordOpen: (announcementId) => {
        set((s) => ({
          openCounts: {
            ...s.openCounts,
            [announcementId]: (s.openCounts[announcementId] ?? 0) + 1,
          },
        }));
      },
    }),
    {
      name: 'featured-recommendations',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
