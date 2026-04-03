import { View, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { NotificationItem } from '@features/notifications/components/NotificationItem';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily, fontSize } from '@theme/typography';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAllRead } = useNotifications();

  const unread = notifications.filter((n) => !n.read);
  const earlier = notifications.filter((n) => n.read);

  return (
    <Screen noHorizontalPadding>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.warm.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} hitSlop={12}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.surface} />
        </View>
      )}

      {!isLoading && notifications.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="notifications-outline" size={40} color={colors.warm.muted} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      )}

      {!isLoading && notifications.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {unread.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionTitle}>New ({unread.length})</Text>
              </View>
              {unread.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </View>
          )}

          {earlier.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionTitle}>Earlier</Text>
              </View>
              {earlier.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: colors.warm.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.warm.border,
    gap: spacing[3],
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.serifBold,
    fontSize: 22,
    color: colors.warm.title,
  },
  markAllRead: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.xs,
    color: colors.warm.body,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  emptyText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  section: {
    marginTop: spacing[2],
  },
  sectionLabel: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  sectionTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  bottomSpacer: {
    height: spacing[16],
  },
});
