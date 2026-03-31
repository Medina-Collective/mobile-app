import { useMemo } from 'react';
import {
  useRecommendationsStore,
  COLD_START_THRESHOLD,
  WARM_THRESHOLD,
} from '@store/recommendations.store';
import type { Announcement, AnnouncementType } from '@app-types/announcement';

// ── Helpers ────────────────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** 0 → 1, where 1 = just posted, 0 = 30+ days old */
function recency(a: Announcement): number {
  const ageDays = (Date.now() - new Date(a.visibilityStart).getTime()) / MS_PER_DAY;
  return Math.max(0, 1 - ageDays / 30);
}

/**
 * Personal affinity score (0 → 1) based on how much the user has engaged
 * with announcements of this type in the past.
 */
function affinity(
  type: AnnouncementType,
  typeScores: Partial<Record<AnnouncementType, number>>,
): number {
  const score = typeScores[type] ?? 0;
  const maxScore = Math.max(1, ...Object.values(typeScores).map(Number));
  return score / maxScore;
}

/**
 * Cold-start diversity sort: round-robin through types so the user sees
 * one of each category before repetition. Within a type, newer items first.
 */
function diversitySort(items: Announcement[]): Announcement[] {
  const buckets = new Map<AnnouncementType, Announcement[]>();

  for (const item of items) {
    const bucket = buckets.get(item.type) ?? [];
    bucket.push(item);
    buckets.set(item.type, bucket);
  }

  for (const [type, bucket] of buckets) {
    buckets.set(
      type,
      [...bucket].sort(
        (a, b) => new Date(b.visibilityStart).getTime() - new Date(a.visibilityStart).getTime(),
      ),
    );
  }

  const result: Announcement[] = [];
  const cursors = new Map<AnnouncementType, number>();
  for (const type of buckets.keys()) cursors.set(type, 0);

  const types = Array.from(buckets.keys());
  let added = true;
  while (added) {
    added = false;
    for (const type of types) {
      const bucket = buckets.get(type)!;
      const cursor = cursors.get(type)!;
      if (cursor < bucket.length) {
        result.push(bucket[cursor]!);
        cursors.set(type, cursor + 1);
        added = true;
      }
    }
  }

  return result;
}

// ── Trending hook ──────────────────────────────────────────────────────────────

/**
 * Returns the top `limit` announcements sorted by how many times users have
 * opened them. Falls back to recency for items with equal (or no) opens so
 * the section is never empty on first launch.
 */
export function useTrendingAnnouncements(announcements: Announcement[], limit = 3): Announcement[] {
  const openCounts = useRecommendationsStore((s) => s.openCounts);

  return useMemo(() => {
    if (announcements.length === 0) return announcements;

    return [...announcements]
      .sort((a, b) => {
        const opensA = openCounts[a.id] ?? 0;
        const opensB = openCounts[b.id] ?? 0;
        if (opensA !== opensB) return opensB - opensA;
        // Tie-break: recency
        return new Date(b.visibilityStart).getTime() - new Date(a.visibilityStart).getTime();
      })
      .slice(0, limit);
  }, [announcements, openCounts, limit]);
}

// ── Ranked (Featured) hook ─────────────────────────────────────────────────────

/**
 * Returns `announcements` re-ranked for the Featured section.
 *
 * Phases:
 *  - Cold start  (< 8 signals)  → round-robin diversity by type
 *  - Warming up  (8 – 25)       → gradual blend from diversity → personal
 *  - Personalised (25+)         → 80 % affinity + 20 % recency
 */
export function useRankedAnnouncements(announcements: Announcement[]): Announcement[] {
  const typeScores = useRecommendationsStore((s) => s.typeScores);
  const signalCount = useRecommendationsStore((s) => s.signalCount);

  return useMemo(() => {
    if (announcements.length === 0) return announcements;

    // Phase 0 — cold start
    if (signalCount < COLD_START_THRESHOLD) {
      return diversitySort(announcements);
    }

    // blend: 0 at COLD_START_THRESHOLD → 1 at WARM_THRESHOLD
    const blend = Math.min(
      1,
      (signalCount - COLD_START_THRESHOLD) / (WARM_THRESHOLD - COLD_START_THRESHOLD),
    );

    return [...announcements].sort((a, b) => {
      const personalA = affinity(a.type, typeScores) * 0.8 + recency(a) * 0.2;
      const personalB = affinity(b.type, typeScores) * 0.8 + recency(b) * 0.2;
      const recencyA = recency(a);
      const recencyB = recency(b);

      const scoreA = blend * personalA + (1 - blend) * recencyA;
      const scoreB = blend * personalB + (1 - blend) * recencyB;

      return scoreB - scoreA;
    });
  }, [announcements, typeScores, signalCount]);
}
