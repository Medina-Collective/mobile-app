import { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { useFollowedAnnouncements } from '@features/follows/hooks/useFollowedAnnouncements';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import type { Announcement } from '@app-types/announcement';

// ── Sub-components ────────────────────────────────────────────────────────────

function FeedSeparator() {
  return <View style={styles.separator} />;
}

function FeedItem({ item }: Readonly<{ item: Announcement }>) {
  return <AnnouncementCard announcement={item} />;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useFollowedAnnouncements();

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

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
          <Text variant="body" style={styles.mutedText}>
            Could not load your feed.
          </Text>
          <Button title="Retry" variant="outline" onPress={handleRetry} style={styles.ctaBtn} />
        </View>
      );
    }

    if (data === undefined || data.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="compass-outline" size={52} color={colors.warm.border} />
          <Text style={styles.emptyTitle}>Your feed is empty</Text>
          <Text style={styles.emptyBody}>
            Follow professional accounts to see their announcements here.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaLabel}>Find pros to follow</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={FeedSeparator}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <Screen noHorizontalPadding>
      <View style={styles.header}>
        <Text style={styles.greeting}>Assalamu Alaikum</Text>
        <Text style={styles.title}>{firstName}</Text>
      </View>
      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[1],
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.warm.muted,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.warm.title,
    letterSpacing: 0.2,
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
    gap: spacing[4],
  },
  mutedText: {
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
  cta: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 24,
    backgroundColor: '#28020a',
  },
  ctaLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  ctaBtn: {
    minWidth: 120,
  },
});
