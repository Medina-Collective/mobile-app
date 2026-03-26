import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { ANNOUNCEMENT_TYPE_LABELS } from '@app-types/announcement';
import { ParticipationButton } from './ParticipationButton';
import { SaveButton } from './SaveButton';
import type { Announcement, AnnouncementType } from '@app-types/announcement';

export type AnnouncementCardVariant = 'default' | 'featured' | 'compact';

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: AnnouncementCardVariant | undefined;
}

/** Dark badge types — dark bg, white text */
const DARK_BADGE_TYPES = new Set<AnnouncementType>(['activity_event', 'halaqa', 'bazaar']);

function getBadgeStyle(type: AnnouncementType): { bg: string; text: string } {
  if (DARK_BADGE_TYPES.has(type)) {
    return { bg: '#28020a', text: '#ffffff' };
  }
  return { bg: 'rgba(160, 122, 95, 0.15)', text: '#5a3a2a' };
}

// ── Default variant ────────────────────────────────────────────────────────────

function DefaultCard({ announcement }: Readonly<{ announcement: Announcement }>) {
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

// ── Featured variant ───────────────────────────────────────────────────────────

function FeaturedCard({ announcement }: Readonly<{ announcement: Announcement }>) {
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
      style={featuredStyles.card}
      activeOpacity={0.88}
      onPress={() => router.push(`/announcements/${announcement.id}`)}
    >
      {/* Cover image */}
      {announcement.coverImageUrl !== undefined ? (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={featuredStyles.coverImage}
          contentFit="cover"
        />
      ) : (
        <View style={featuredStyles.coverPlaceholder} />
      )}

      <View style={featuredStyles.body}>
        {/* Badge + heart row */}
        <View style={featuredStyles.badgeRow}>
          <View style={[featuredStyles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[featuredStyles.badgeText, { color: badge.text }]}>
              {ANNOUNCEMENT_TYPE_LABELS[announcement.type].toUpperCase()}
            </Text>
          </View>

          {announcement.audience === 'pro_only' && (
            <View style={styles.proBadge}>
              <Ionicons name="people-outline" size={10} color="#9b6fd4" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}

          <View style={styles.spacer} />
          <SaveButton announcementId={announcement.id} />
        </View>

        {/* Avatar + brand row */}
        <View style={featuredStyles.brandRow}>
          {announcement.professionalLogoUrl === undefined ? (
            <View style={featuredStyles.avatarFallback}>
              <Ionicons name="storefront-outline" size={10} color="rgba(40, 2, 10, 0.45)" />
            </View>
          ) : (
            <Image
              source={{ uri: announcement.professionalLogoUrl }}
              style={featuredStyles.avatar}
              contentFit="cover"
            />
          )}
          {announcement.professionalName.length > 0 && (
            <Text style={featuredStyles.brandName} numberOfLines={1}>
              {announcement.professionalName}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text style={featuredStyles.title} numberOfLines={2}>
          {announcement.title}
        </Text>

        {/* Description */}
        {announcement.description !== undefined && (
          <Text style={featuredStyles.description} numberOfLines={2}>
            {announcement.description}
          </Text>
        )}

        {/* Meta */}
        {(dateLabel !== undefined || announcement.location !== undefined) && (
          <View style={styles.metaRow}>
            {dateLabel !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={11} color={colors.warm.muted} />
                <Text style={featuredStyles.metaText}>{dateLabel}</Text>
              </View>
            )}
            {timeLabel !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={11} color={colors.warm.muted} />
                <Text style={featuredStyles.metaText}>{timeLabel}</Text>
              </View>
            )}
            {announcement.location !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={11} color={colors.warm.muted} />
                <Text style={featuredStyles.metaText} numberOfLines={1}>{announcement.location}</Text>
              </View>
            )}
          </View>
        )}

        {/* Full-width participation button */}
        {announcement.participationEnabled && (
          <View style={featuredStyles.participationWrapper}>
            <ParticipationButton
              announcementId={announcement.id}
              participantCount={announcement.participantCount}
              maxCapacity={announcement.maxCapacity}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Compact variant ────────────────────────────────────────────────────────────

function CompactCard({ announcement }: Readonly<{ announcement: Announcement }>) {
  const router = useRouter();

  const dateLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      style={compactStyles.card}
      activeOpacity={0.88}
      onPress={() => router.push(`/announcements/${announcement.id}`)}
    >
      {/* Left: square image */}
      {announcement.coverImageUrl !== undefined ? (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={compactStyles.image}
          contentFit="cover"
        />
      ) : (
        <View style={compactStyles.imagePlaceholder} />
      )}

      {/* Center: content */}
      <View style={compactStyles.content}>
        {announcement.professionalName.length > 0 && (
          <Text style={compactStyles.brandName} numberOfLines={1}>
            {announcement.professionalName}
          </Text>
        )}
        <Text style={compactStyles.title} numberOfLines={2}>
          {announcement.title}
        </Text>
        {dateLabel !== undefined && (
          <View style={compactStyles.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={colors.warm.muted} />
            <Text style={compactStyles.dateText}>{dateLabel}</Text>
          </View>
        )}
      </View>

      {/* Right: bookmark */}
      <SaveButton announcementId={announcement.id} />
    </TouchableOpacity>
  );
}

// ── Public export ──────────────────────────────────────────────────────────────

export function AnnouncementCard({
  announcement,
  variant = 'default',
}: Readonly<AnnouncementCardProps>) {
  if (variant === 'featured') {
    return <FeaturedCard announcement={announcement} />;
  }
  if (variant === 'compact') {
    return <CompactCard announcement={announcement} />;
  }
  return <DefaultCard announcement={announcement} />;
}

// ── Shared styles ──────────────────────────────────────────────────────────────

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
    fontFamily: fontFamily.serifBold,
    fontSize: 16,
    color: colors.warm.title,
    lineHeight: 22,
  },
  description: {
    fontFamily: fontFamily.sansRegular,
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

// ── Featured styles ────────────────────────────────────────────────────────────

const featuredStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.warm.elevated,
  },
  coverPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.warm.elevated,
  },
  body: {
    padding: spacing[4],
    gap: spacing[2],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
  brandRow: {
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
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warm.body,
    flexShrink: 1,
  },
  title: {
    fontFamily: fontFamily.serifBold,
    fontSize: 15,
    color: colors.warm.title,
    lineHeight: 21,
  },
  description: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    color: colors.warm.muted,
    lineHeight: 18,
  },
  metaText: {
    fontSize: 11,
    color: colors.warm.body,
  },
  participationWrapper: {
    marginTop: spacing[2],
  },
});

// ── Compact styles ─────────────────────────────────────────────────────────────

const compactStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.warm.border,
    padding: spacing[3],
    gap: spacing[3],
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.warm.elevated,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  brandName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.warm.muted,
  },
  title: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 14,
    color: colors.warm.title,
    lineHeight: 19,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dateText: {
    fontSize: 11,
    color: colors.warm.muted,
  },
});
