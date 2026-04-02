import { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import { ANNOUNCEMENT_TYPE_OPTIONS } from '@features/announcements/schemas/announcement.schema';
import { ANNOUNCEMENT_TYPE_LABELS } from '@app-types/announcement';
import type { Announcement, AnnouncementType } from '@app-types/announcement';

function AnnouncementSeparator() {
  return <View style={styles.separator} />;
}

interface FeedContentProps {
  isError: boolean;
  data: Announcement[] | undefined;
  refreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
}

function FeedContent({
  isError,
  data,
  refreshing,
  onRefresh,
  onRetry,
}: Readonly<FeedContentProps>) {
  if (isError) {
    return (
      <View style={styles.centered}>
        <Text variant="body" style={styles.emptyText}>
          Could not load announcements.
        </Text>
        <Button title="Retry" variant="outline" onPress={onRetry} style={styles.retryBtn} />
      </View>
    );
  }
  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AnnouncementCard announcement={item} />}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={AnnouncementSeparator}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text variant="body" style={styles.emptyText}>
            No announcements right now.{'\n'}Check back soon!
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const ALL_FILTER = 'all' as const;
type FilterValue = typeof ALL_FILTER | AnnouncementType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: ALL_FILTER, label: 'All' },
  ...ANNOUNCEMENT_TYPE_OPTIONS.map((t) => ({
    value: t.value,
    label: ANNOUNCEMENT_TYPE_LABELS[t.value],
  })),
];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isPro = user?.role === USER_ROLES.PROFESSIONAL;

  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);

  const { data, isLoading, isError, isRefetching, refetch } = useListAnnouncements(
    activeFilter === ALL_FILTER ? undefined : activeFilter,
  );

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch().catch(() => null);
  }, [refetch]);

  return (
    <Screen noHorizontalPadding style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="heading2">Announcements</Text>
          <Text variant="bodySm" style={styles.subtitle}>
            What's happening in your community
          </Text>
        </View>
      </View>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveFilter(f.value)}
              activeOpacity={0.75}
            >
              <Text
                variant="caption"
                style={[styles.chipLabel, isActive && styles.chipLabelActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Feed */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      ) : (
        <FeedContent
          isError={isError}
          data={data}
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          onRetry={handleRetry}
        />
      )}

      {/* PRO floating action button */}
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
  screen: {
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  subtitle: {
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[0],
  },
  chipActive: {
    backgroundColor: colors.burgundy.mid,
    borderColor: colors.burgundy.mid,
  },
  chipLabel: {
    color: colors.neutral[600],
    fontWeight: '500',
  },
  chipLabelActive: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[24],
  },
  separator: {
    height: spacing[4],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  emptyText: {
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    width: 120,
  },
  fab: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.neutral[0],
    lineHeight: 32,
  },
});
