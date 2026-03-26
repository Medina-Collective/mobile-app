import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ANNOUNCEMENT_TYPE_LABELS } from '@app-types/announcement';
import { ParticipationButton } from './ParticipationButton';
import { SaveButton } from './SaveButton';
import type { Announcement, AnnouncementType } from '@app-types/announcement';

interface AnnouncementCardProps {
  announcement: Announcement;
}

/** Dark badge types — dark bg, white text */
const DARK_BADGE_TYPES = new Set<AnnouncementType>(['activity_event', 'halaqa', 'bazaar']);

function getBadgeStyle(type: AnnouncementType): { bg: string; text: string } {
  if (DARK_BADGE_TYPES.has(type)) {
    return { bg: '#28020a', text: '#ffffff' };
  }
  return { bg: 'rgba(160, 122, 95, 0.15)', text: '#5a3a2a' };
}

export function AnnouncementCard({ announcement }: Readonly<AnnouncementCardProps>) {
  const router = useRouter();
  const badge = getBadgeStyle(announcement.type);

  const dateLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'MMM d, yyyy');

  const timeLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'HH:mm');

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
        {/* Top row: avatar + name + badge + save button */}
        <View style={styles.topRow}>
          {/* Avatar */}
          {announcement.professionalLogoUrl === undefined ? (
            <View style={styles.avatarFallback}>
              <Ionicons name="storefront-outline" size={12} color="rgba(40, 2, 10, 0.45)" />
            </View>
          ) : (
            <Image
              source={{ uri: announcement.professionalLogoUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          )}

          {/* Professional name */}
          {announcement.professionalName.length > 0 && (
            <Text style={styles.proName} numberOfLines={1}>
              {announcement.professionalName}
            </Text>
          )}

          {/* Type badge */}
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {ANNOUNCEMENT_TYPE_LABELS[announcement.type].toUpperCase()}
            </Text>
          </View>

          {/* PRO-only badge */}
          {announcement.audience === 'pro_only' && (
            <View style={styles.proBadge}>
              <Ionicons name="people-outline" size={10} color="#9b6fd4" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}

          <View style={styles.spacer} />

          {/* Save button */}
          <SaveButton announcementId={announcement.id} />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        {/* Description */}
        {announcement.description !== undefined && (
          <Text style={styles.description} numberOfLines={2}>
            {announcement.description}
          </Text>
        )}

        {/* Meta row */}
        {(dateLabel !== undefined || announcement.location !== undefined) && (
          <View style={styles.metaRow}>
            {dateLabel !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={12} color={colors.warm.muted} />
                <Text style={styles.metaText}>{dateLabel}</Text>
              </View>
            )}
            {timeLabel !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={colors.warm.muted} />
                <Text style={styles.metaText}>{timeLabel}</Text>
              </View>
            )}
            {announcement.location !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color={colors.warm.muted} />
                <Text style={styles.metaText} numberOfLines={1}>{announcement.location}</Text>
              </View>
            )}
          </View>
        )}

        {/* Participation button */}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.warm.elevated,
  },
  body: {
    padding: spacing[4],
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexShrink: 0,
  },
  avatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(40, 2, 10, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  proName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warm.body,
    flexShrink: 1,
    flexGrow: 0,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    backgroundColor: 'rgba(130, 80, 210, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(130, 80, 210, 0.20)',
    flexShrink: 0,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9b6fd4',
    letterSpacing: 0.3,
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warm.title,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.warm.muted,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 12,
    color: colors.warm.body,
  },
  participationWrapper: {
    marginTop: spacing[1],
  },
});
