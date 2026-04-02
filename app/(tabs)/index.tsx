import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { SectionHeader } from '@components/SectionHeader';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { useAuth } from '@features/auth';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { useRankedAnnouncements } from '@features/announcements/hooks/useRecommendations';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import { filterChipStyles } from '@components/ui/filterChipStyles';
import type { AnnouncementType } from '@app-types/announcement';

// ── Filter config ─────────────────────────────────────────────────────────────

const HOME_FILTERS: { label: string; type: AnnouncementType | undefined }[] = [
  { label: 'All', type: undefined },
  { label: 'Events', type: 'activity_event' as AnnouncementType },
  { label: 'Offers', type: 'limited_offer' as AnnouncementType },
  { label: 'Halaqas', type: 'halaqa' as AnnouncementType },
  { label: 'Activities', type: 'bazaar' as AnnouncementType },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const activeFilterType: AnnouncementType | undefined = HOME_FILTERS[activeFilterIndex]?.type;

  const { data: allAnnouncements = [], isRefetching, refetch } = useListAnnouncements(activeFilterType);
  const featuredAnnouncements = useRankedAnnouncements(allAnnouncements);

  const handleRefresh = useCallback(() => {
    refetch().catch(() => null);
  }, [refetch]);

  // "Coming Up" card — first announcement with a future eventStart, else first item
  const now = new Date();
  const upcomingAnnouncement =
    allAnnouncements.find((a) => a.eventStart !== undefined && new Date(a.eventStart) > now) ??
    allAnnouncements[0];

  // "Your Feed" — filtered announcements, up to 4
  const feedItems = allAnnouncements.slice(0, 4);

  // Upcoming events list (max 2, compact)
  const upcomingEvents = allAnnouncements.filter((a) => a.eventStart !== undefined).slice(0, 2);

  // Limited offers (featured, fixed width 260px)
  const limitedOffers = allAnnouncements.filter((a) => a.type === 'limited_offer');

  return (
    <Screen noHorizontalPadding>
      {/* ── 1. Header (fixed, outside ScrollView) ──────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Assalamu Alaikum</Text>
          <Text style={styles.firstName}>{firstName}</Text>
        </View>
        <View style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.warm.title} />
          <View style={styles.notificationDot} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.burgundy.mid} />
        }
      >
        {/* ── 2. Coming Up Card ──────────────────────────────────────────── */}
        <View style={styles.comingUpWrapper}>
          {upcomingAnnouncement === undefined ? (
            <View style={styles.comingUpCard}>
              <View style={styles.comingUpLabelRow}>
                <Ionicons name="calendar-outline" size={16} color="#ffffff" />
                <Text style={styles.comingUpLabel}>COMING UP</Text>
              </View>
              <Text style={styles.comingUpTitle}>No upcoming events</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.comingUpCard}
              activeOpacity={0.88}
              onPress={() => router.push(`/announcements/${upcomingAnnouncement.id}`)}
            >
              {/* Top label row */}
              <View style={styles.comingUpLabelRow}>
                <Ionicons name="calendar-outline" size={16} color="#ffffff" />
                <Text style={styles.comingUpLabel}>COMING UP</Text>
              </View>

              {/* Event title */}
              <Text style={styles.comingUpTitle} numberOfLines={2}>
                {upcomingAnnouncement.title}
              </Text>

              {/* Date + time */}
              {upcomingAnnouncement.eventStart !== undefined && (
                <Text style={styles.comingUpMeta}>
                  {format(new Date(upcomingAnnouncement.eventStart), 'EEE, MMM d · HH:mm')}
                </Text>
              )}

              {/* View details row */}
              <View style={styles.comingUpFooter}>
                <Text style={styles.comingUpViewDetails}>View details</Text>
                <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.9)" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 3. Category Filter Chips ───────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersScroll}
        >
          {HOME_FILTERS.map((filter, index) => {
            const isActive = activeFilterIndex === index;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[filterChipStyles.chip, isActive && filterChipStyles.chipActive]}
                onPress={() => setActiveFilterIndex(index)}
                activeOpacity={0.75}
              >
                <Text
                  style={[filterChipStyles.chipLabel, isActive && filterChipStyles.chipLabelActive]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── 4. Featured Section ────────────────────────────────────────── */}
        <View style={styles.featuredSection}>
          <SectionHeader
            title="Featured"
            subtitle="Curated for you"
            onSeeAll={() => router.push('/(tabs)/discover')}
          />
          {featuredAnnouncements.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScrollContent}
            >
              {featuredAnnouncements.map((item) => (
                <View key={item.id} style={styles.featuredCardWrapper}>
                  <AnnouncementCard announcement={item} variant="featured" />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No announcements yet — check back soon!</Text>
            </View>
          )}
        </View>

        {/* ── 5. Your Feed Section ──────────────────────────────────────── */}
        <View style={styles.feedSection}>
          <SectionHeader
            title="Your Feed"
            subtitle="From accounts you follow"
            onSeeAll={() => router.push('/(tabs)/discover')}
          />
          {feedItems.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No announcements yet — check back soon!</Text>
            </View>
          ) : (
            <View style={[styles.feedList, styles.feedListPadded]}>
              {feedItems.map((item, index) => (
                <View key={item.id} style={index > 0 ? styles.feedItemGap : undefined}>
                  <AnnouncementCard announcement={item} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── 6. Upcoming Events Section ────────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <View style={styles.upcomingSection}>
            <SectionHeader
              title="Upcoming Events"
              onSeeAll={() => router.push('/(tabs)/discover')}
            />
            <View style={[styles.feedList, styles.feedListPadded]}>
              {upcomingEvents.map((item, index) => (
                <View key={item.id} style={index > 0 ? styles.feedItemGap : undefined}>
                  <AnnouncementCard announcement={item} variant="compact" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 7. Limited Offers Section ─────────────────────────────────── */}
        {limitedOffers.length > 0 && (
          <View style={styles.offersSection}>
            <SectionHeader
              title="Limited Offers"
              subtitle="Don't miss out"
              onSeeAll={() => router.push('/(tabs)/discover')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScrollContent}
            >
              {limitedOffers.map((item) => (
                <View key={item.id} style={styles.offersCardWrapper}>
                  <AnnouncementCard announcement={item} variant="featured" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing[8],
  },

  // Header (sticky)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    backgroundColor: colors.warm.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.warm.muted,
  },
  firstName: {
    fontFamily: fontFamily.serifBold,
    fontSize: 22,
    color: colors.warm.title,
    lineHeight: 28,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warm.surface,
    borderWidth: 1,
    borderColor: colors.warm.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: colors.warm.bg,
  },

  // Coming Up Card
  comingUpWrapper: {
    paddingHorizontal: spacing[5],
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  comingUpCard: {
    backgroundColor: '#2F0A0A',
    borderRadius: 20,
    padding: spacing[5],
    gap: spacing[2],
  },
  comingUpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  comingUpLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  comingUpTitle: {
    fontFamily: fontFamily.serifBold,
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 24,
  },
  comingUpMeta: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  comingUpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  comingUpViewDetails: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Filter chips
  filtersScroll: {
    marginTop: spacing[3],
    marginBottom: spacing[5],
  },
  filtersContent: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[1],
  },

  // Section spacing
  featuredSection: {
    marginTop: spacing[6],
  },
  feedSection: {
    marginTop: spacing[8],
  },
  upcomingSection: {
    marginTop: spacing[8],
  },
  offersSection: {
    marginTop: spacing[8],
  },

  // Featured horizontal scroll
  featuredScrollContent: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  featuredCardWrapper: {
    width: 280,
  },
  offersCardWrapper: {
    width: 260,
  },

  // Feed list (vertical)
  feedList: {
    gap: 0,
  },
  feedListPadded: {
    paddingHorizontal: spacing[5],
  },
  feedItemGap: {
    marginTop: spacing[3],
  },

  // Empty states
  emptyRow: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  emptyText: {
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
  },
});
