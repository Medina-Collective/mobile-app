import { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@store/saved.store';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import type { Announcement } from '@app-types/announcement';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = ['All Saved', 'Events', 'Offers', 'Updates'] as const;
type Tab = (typeof TABS)[number];

function filterByTab(items: Announcement[], tab: Tab): Announcement[] {
  if (tab === 'All Saved') return items;
  if (tab === 'Events')
    return items.filter((a) =>
      ['activity_event', 'halaqa', 'bazaar', 'brand_popup'].includes(a.type),
    );
  if (tab === 'Offers') return items.filter((a) => a.type === 'limited_offer');
  return items.filter((a) => a.type === 'update' || a.type === 'other');
}

// ── Screen ────────────────────────────────────────────────────────────────────

function CardSeparator() {
  return <View style={styles.separator} />;
}

export default function FavoritesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('All Saved');
  const savedIds = useSavedStore((s) => s.savedIds);
  const { data, isLoading, isError, refetch } = useListAnnouncements();

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const saved = (data ?? []).filter((a) => savedIds.includes(a.id));
  const filtered = filterByTab(saved, activeTab);

  function renderContent() {
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
          <Text style={styles.mutedText}>Could not load saved announcements.</Text>
          <Button title="Retry" variant="outline" onPress={handleRetry} style={styles.retryBtn} />
        </View>
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="bookmark-outline" size={48} color={colors.warm.border} />
          <Text style={styles.emptyTitle}>
            {saved.length === 0 ? 'Nothing saved yet' : `No ${activeTab.toLowerCase()}`}
          </Text>
          <Text style={styles.emptyBody}>
            {saved.length === 0
              ? 'Tap the bookmark icon on any announcement to save it here.'
              : 'Items you save in this category will appear here.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={CardSeparator}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <Screen noHorizontalPadding>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Your saved events, offers, and posts</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabsScroll}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {renderContent()}
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

  // Tabs
  tabsScroll: {
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  tabsContent: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[1],
  },
  chip: {
    flexShrink: 0,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
  },
  chipActive: {
    backgroundColor: '#2F0A0A',
    borderColor: '#2F0A0A',
  },
  chipLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.warm.title,
  },
  chipLabelActive: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: '#ffffff',
  },

  // List
  list: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[16],
  },
  separator: {
    height: spacing[3],
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  mutedText: {
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 17,
    color: colors.warm.title,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    minWidth: 120,
  },
});
