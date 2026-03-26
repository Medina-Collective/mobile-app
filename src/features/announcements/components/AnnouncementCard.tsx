import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import {
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_COLORS,
} from '@app-types/announcement';
import { ParticipationButton } from './ParticipationButton';
import { SaveButton } from './SaveButton';
import type { Announcement } from '@app-types/announcement';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface AnnouncementCardProps {
  announcement: Announcement;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isSameDay(s, e)) return format(s, 'MMM d, yyyy');
  const sFormatted = format(s, s.getFullYear() === e.getFullYear() ? 'MMM d' : 'MMM d, yyyy');
  return `${sFormatted} – ${format(e, 'MMM d, yyyy')}`;
}

export function AnnouncementCard({ announcement }: Readonly<AnnouncementCardProps>) {
  const router = useRouter();
  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type];
  const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type] as IoniconName;

  const eventDateLabel =
    announcement.eventStart !== undefined
      ? announcement.eventEnd !== undefined
        ? formatDateRange(announcement.eventStart, announcement.eventEnd)
        : format(new Date(announcement.eventStart), 'MMM d, yyyy')
      : undefined;

  const visibilityEndLabel = format(new Date(announcement.visibilityEnd), 'MMM d');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => router.push(`/announcements/${announcement.id}`)}
    >
      {/* Cover image */}
      {announcement.coverImageUrl !== undefined && (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={styles.coverImage}
          contentFit="cover"
        />
      )}

      <View style={styles.body}>
        {/* Top row: badges + save button */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: typeColor.bg }]}>
              <Ionicons name={typeIcon} size={11} color={typeColor.text} />
              <Text style={[styles.badgeText, { color: typeColor.text }]}>
                {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
              </Text>
            </View>
            {announcement.audience === 'pro_only' && (
              <View style={styles.proBadge}>
                <Ionicons name="people-outline" size={11} color="#4a2280" />
                <Text style={styles.proBadgeText}>PROs only</Text>
              </View>
            )}
          </View>
          <SaveButton announcementId={announcement.id} />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        {/* Location */}
        {announcement.location !== undefined && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.warm.muted} />
            <Text style={styles.metaText}>{announcement.location}</Text>
          </View>
        )}

        {/* Event dates */}
        {eventDateLabel !== undefined && (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.warm.muted} />
            <Text style={styles.metaText}>{eventDateLabel}</Text>
          </View>
        )}

        {/* Visibility end */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={colors.warm.muted} />
          <Text style={styles.visibility}>Visible until {visibilityEndLabel}</Text>
        </View>

        {/* Participation */}
        {announcement.participationEnabled && (
          <View style={styles.participationWrapper}>
            <ParticipationButton
              announcementId={announcement.id}
              participantCount={announcement.participantCount}
              maxCapacity={announcement.maxCapacity}
              compact
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    overflow: 'hidden',
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.warm.bg,
  },
  body: {
    padding: spacing[4],
    gap: spacing[2],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[1],
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[1],
    backgroundColor: 'rgba(74, 34, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 34, 128, 0.15)',
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a2280',
    letterSpacing: 0.3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.warm.title,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 13,
    color: colors.warm.body,
  },
  visibility: {
    fontSize: 11,
    color: colors.warm.muted,
  },
  participationWrapper: {
    marginTop: spacing[2],
  },
});
