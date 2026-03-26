import { useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore } from '@store/saved.store';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import type { Announcement } from '@app-types/announcement';

function CardSeparator() {
  return <View style={styles.separator} />;
}

function CardItem({ item }: Readonly<{ item: Announcement }>) {
  return <AnnouncementCard announcement={item} />;
}

export default function FavoritesScreen() {
  const savedIds = useSavedStore((s) => s.savedIds);
  const { data, isLoading, isError, refetch } = useListAnnouncements();

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const saved = (data ?? []).filter((a) => savedIds.includes(a.id));

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

    if (saved.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="bookmark-outline" size={48} color={colors.warm.border} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>
            Tap the bookmark icon on any announcement to save it here.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={CardSeparator}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <Screen noHorizontalPadding>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>Announcements you bookmarked</Text>
      </View>
      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.warm.title,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.warm.muted,
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[16],
  },
  separator: {
    height: spacing[4],
  },
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
    fontSize: 17,
    fontWeight: '600',
    color: colors.warm.title,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: colors.warm.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    minWidth: 120,
  },
});
