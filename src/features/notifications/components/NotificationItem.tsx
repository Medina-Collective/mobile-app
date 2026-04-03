import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily, fontSize } from '@theme/typography';

export type NotificationType =
  | 'event_reminder'
  | 'new_follower'
  | 'offer'
  | 'announcement'
  | 'saved_event'
  | 'community';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

type IconConfig = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  bg: string;
  color: string;
};

const ICON_CONFIG: Record<NotificationType, IconConfig> = {
  event_reminder: {
    name: 'calendar-outline',
    bg: colors.burgundy.surface,
    color: colors.beige[200],
  },
  new_follower: {
    name: 'person-add-outline',
    bg: '#e8e3dd',
    color: colors.warm.title,
  },
  offer: {
    name: 'pricetag-outline',
    bg: '#e8e3dd',
    color: colors.warm.title,
  },
  announcement: {
    name: 'megaphone-outline',
    bg: '#e8e3dd',
    color: colors.warm.title,
  },
  saved_event: {
    name: 'heart-outline',
    bg: colors.burgundy.surface,
    color: colors.beige[200],
  },
  community: {
    name: 'notifications-outline',
    bg: '#e8e3dd',
    color: colors.warm.title,
  },
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: Readonly<NotificationItemProps>) {
  const config = ICON_CONFIG[notification.type];

  return (
    <View style={[styles.row, !notification.read && styles.unreadBg]}>
      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        <Ionicons name={config.name} size={18} color={config.color} />
      </View>
      <View style={styles.textBlock}>
        <Text
          style={[styles.title, notification.read ? styles.titleRead : styles.titleUnread]}
          numberOfLines={2}
        >
          {notification.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {notification.subtitle}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>{notification.time}</Text>
        {!notification.read && <View style={styles.dot} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3] + 2,
    gap: spacing[3],
  },
  unreadBg: {
    backgroundColor: colors.beige[50],
  },
  iconWrap: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  titleUnread: {
    fontFamily: fontFamily.sansSemiBold,
    color: colors.warm.title,
  },
  titleRead: {
    fontFamily: fontFamily.sansMedium,
    color: colors.warm.title,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.6,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing[1],
    flexShrink: 0,
    paddingTop: 2,
  },
  time: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.burgundy.surface,
  },
});
