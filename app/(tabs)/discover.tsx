import { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
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

const ALL_FILTER = 'all' as const;
type FilterValue = typeof ALL_FILTER | AnnouncementType;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: ALL_FILTER, label: 'All' },
  ...ANNOUNCEMENT_TYPE_OPTIONS.map((t) => ({
    value: t.value,
    label: ANNOUNCEMENT_TYPE_LABELS[t.value],
  })),
];

function CardItem({ item }: Readonly<{ item: Announcement }>) {
  return <AnnouncementCard announcement={item} />;
}

function CardSeparator() {
  return <View style={styles.separator} />;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const isPro = useAuthStore((s) => s.user?.role === USER_ROLES.PROFESSIONAL);
  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);

  const { data, isLoading, isError, refetch } = useListAnnouncements(
    activeFilter === ALL_FILTER ? undefined : activeFilter,
  );

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  function renderFeed() {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text variant="body" style={styles.mutedText}>
            Could not load announcements.
          </Text>
          <Button title="Retry" variant="outline" onPress={handleRetry} style={styles.retryBtn} />
        </View>
      );
    }

    return (
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={CardSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="body" style={styles.mutedText}>
              Nothing here yet — check back soon!
            </Text>
          </View>
        }
      />
    );
  }

  return (
    <Screen noHorizontalPadding>
      <View style={styles.header}>
        <Text variant="heading2" style={styles.title}>Discover</Text>
        <Text variant="bodySm" style={styles.subtitle}>
          What's happening in the community
        </Text>
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
                numberOfLines={1}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {renderFeed()}

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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: {
    color: colors.warm.title,
  },
  subtitle: {
    color: colors.warm.muted,
  },
  filtersScroll: {
    height: 40,
    marginBottom: spacing[3],
  },
  filters: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  chip: {
    flexShrink: 0,
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.burgundy.mid,
    borderColor: colors.burgundy.mid,
    shadowOpacity: 0,
  },
  chipLabel: {
    color: colors.warm.body,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#28020a',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[28],
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
  mutedText: {
    color: colors.warm.muted,
    textAlign: 'center',
  },
  retryBtn: {
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 106,
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#28020a',
    lineHeight: 32,
  },
});
