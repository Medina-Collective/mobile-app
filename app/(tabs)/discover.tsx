import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { SectionHeader } from '@components/SectionHeader';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { useTrendingAnnouncements } from '@features/announcements/hooks/useRecommendations';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import { ANNOUNCEMENT_TYPE_OPTIONS } from '@features/announcements/schemas/announcement.schema';
import { ANNOUNCEMENT_TYPE_LABELS } from '@app-types/announcement';
import { filterChipStyles } from '@components/ui/filterChipStyles';
import type { AnnouncementType } from '@app-types/announcement';

const ALL_FILTER = 'all' as const;
type FilterValue = typeof ALL_FILTER | AnnouncementType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: ALL_FILTER, label: 'All' },
  ...ANNOUNCEMENT_TYPE_OPTIONS.map((t) => ({
    value: t.value,
    label: ANNOUNCEMENT_TYPE_LABELS[t.value],
  })),
];

export default function DiscoverScreen() {
  const router = useRouter();
  const isPro = useAuthStore((s) => s.user?.role === USER_ROLES.PROFESSIONAL);
  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: allAnnouncements = [],
    isLoading,
    isError,
    refetch,
  } = useListAnnouncements(undefined);

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Trending: top 3 by open count, falls back to recency
  const trendingItems = useTrendingAnnouncements(allAnnouncements, 3);

  // Browse: filtered by type + search
  const browseItems = allAnnouncements
    .filter((a) => activeFilter === ALL_FILTER || a.type === activeFilter)
    .filter(
      (a) =>
        searchQuery.trim() === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.professionalName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const browseTitle =
    activeFilter === ALL_FILTER
      ? 'Browse All'
      : (FILTERS.find((f) => f.value === activeFilter)?.label ?? 'Browse All');

  return (
    <Screen noHorizontalPadding>
      {/* ── Header (fixed, outside ScrollView) ────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Explore what's happening in Montreal</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Search Row ──────────────────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={18} color={colors.warm.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, brands, offers..."
              placeholderTextColor={colors.warm.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ── Filter Chips ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[filterChipStyles.chip, isActive && filterChipStyles.chipActive]}
                onPress={() => setActiveFilter(f.value)}
                activeOpacity={0.75}
              >
                <Text
                  style={[filterChipStyles.chipLabel, isActive && filterChipStyles.chipLabelActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Trending Now ────────────────────────────────────────────────── */}
        {trendingItems.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Trending Now" onSeeAll={() => router.push('/(tabs)/discover')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingContent}
            >
              {trendingItems.map((item) => (
                <View key={item.id} style={styles.trendingCard}>
                  <AnnouncementCard announcement={item} variant="featured" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Browse All ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader title={browseTitle} />

          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.burgundy.mid} />
            </View>
          )}

          {isError && (
            <View style={styles.centered}>
              <Text style={styles.mutedText}>Could not load announcements.</Text>
              <Button
                title="Retry"
                variant="outline"
                onPress={handleRetry}
                style={styles.retryBtn}
              />
            </View>
          )}

          {!isLoading && !isError && browseItems.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          )}

          <View style={styles.browseList}>
            {!isLoading &&
              !isError &&
              browseItems.map((item, index) => (
                <View key={item.id} style={index > 0 ? styles.cardGap : undefined}>
                  <AnnouncementCard announcement={item} />
                </View>
              ))}
          </View>
        </View>
      </ScrollView>

      {isPro && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/announcements/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
    backgroundColor: colors.warm.bg,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.serifBold,
    fontSize: 22,
    color: colors.warm.title,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    color: colors.warm.muted,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    marginTop: spacing[4],
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.warm.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warm.border,
    paddingHorizontal: spacing[3],
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    color: colors.warm.title,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2F0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chips
  chipsScroll: {
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  chips: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[1],
  },

  // Sections
  section: {
    marginTop: spacing[6],
  },
  // Trending
  trendingContent: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  trendingCard: {
    width: 260,
  },

  // Browse list
  browseList: {
    paddingHorizontal: spacing[5],
  },
  cardGap: {
    marginTop: spacing[3],
  },

  // States
  centered: {
    paddingVertical: spacing[8],
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[5],
  },
  mutedText: {
    color: colors.warm.muted,
    textAlign: 'center',
  },
  retryBtn: {
    minWidth: 120,
  },
  emptyState: {
    paddingVertical: spacing[12],
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  emptyTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 15,
    color: colors.warm.body,
  },
  emptySubtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    lineHeight: 32,
  },
});
