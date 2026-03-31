import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { useRecommendationsStore } from '@store/recommendations.store';
import { ParticipationButton } from './ParticipationButton';
import { SaveButton } from './SaveButton';
import type { Announcement, AnnouncementType } from '@app-types/announcement';

export type AnnouncementCardVariant = 'default' | 'featured' | 'compact';

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: AnnouncementCardVariant | undefined;
}

// ── Type config ────────────────────────────────────────────────────────────────

function getTypeConfig(type: AnnouncementType): {
  label: string;
  cta: string;
  badgeBg: string;
  badgeText: string;
} {
  if (type === 'activity_event' || type === 'halaqa' || type === 'bazaar') {
    return { label: 'Event', cta: 'Participate', badgeBg: '#2F0A0A', badgeText: '#ffffff' };
  }
  if (type === 'limited_offer') {
    return {
      label: 'Offer',
      cta: 'View Offer',
      badgeBg: 'rgba(206, 193, 174, 0.5)',
      badgeText: '#2F0A0A',
    };
  }
  if (type === 'brand_popup') {
    return {
      label: 'Offer',
      cta: 'View Offer',
      badgeBg: 'rgba(206, 193, 174, 0.5)',
      badgeText: '#2F0A0A',
    };
  }
  if (type === 'update') {
    return {
      label: 'Update',
      cta: 'Learn More',
      badgeBg: 'rgba(100, 149, 237, 0.15)',
      badgeText: '#4a73c4',
    };
  }
  return {
    label: 'Announcement',
    cta: 'Learn More',
    badgeBg: colors.warm.elevated,
    badgeText: colors.warm.body,
  };
}

function getCtaLabel(
  typeConfig: ReturnType<typeof getTypeConfig>,
  participationEnabled: boolean,
): string {
  if (typeConfig.cta === 'Participate' && participationEnabled) {
    return 'Participate';
  }
  return typeConfig.cta;
}

// ── Default variant ────────────────────────────────────────────────────────────

function DefaultCard({ announcement }: Readonly<{ announcement: Announcement }>) {
  const router = useRouter();
  const recordOpen = useRecommendationsStore((s) => s.recordOpen);
  const typeConfig = getTypeConfig(announcement.type);
  const ctaLabel = getCtaLabel(typeConfig, announcement.participationEnabled);

  const dateLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'MMM d, yyyy');

  const timeLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'HH:mm');

  const deadlineLabel =
    announcement.deadline === undefined
      ? undefined
      : format(new Date(announcement.deadline), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      style={defaultStyles.card}
      activeOpacity={0.88}
      onPress={() => {
        recordOpen(announcement.id);
        router.push(`/announcements/${announcement.id}`);
      }}
    >
      {/* Top row: avatar + brand column + save button */}
      <View style={defaultStyles.topRow}>
        {/* Left group: avatar + name + badge */}
        <View style={defaultStyles.topLeft}>
          {/* Avatar */}
          {announcement.professionalLogoUrl === undefined ? (
            <View style={defaultStyles.avatarFallback} />
          ) : (
            <Image
              source={{ uri: announcement.professionalLogoUrl }}
              style={defaultStyles.avatar}
              contentFit="cover"
            />
          )}

          {/* Name + badge column */}
          <View style={defaultStyles.topLeftText}>
            {announcement.professionalName.length > 0 && (
              <Text style={defaultStyles.brandName} numberOfLines={1}>
                {announcement.professionalName}
              </Text>
            )}
            <View style={[defaultStyles.badge, { backgroundColor: typeConfig.badgeBg }]}>
              <Text style={[defaultStyles.badgeText, { color: typeConfig.badgeText }]}>
                {typeConfig.label.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Save button (bookmark icon) */}
        <SaveButton
          announcementId={announcement.id}
          announcementType={announcement.type}
          iconType="bookmark"
        />
      </View>

      {/* Cover image */}
      {announcement.coverImageUrl !== undefined && (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={defaultStyles.coverImage}
          contentFit="cover"
        />
      )}

      {/* Title */}
      <Text style={defaultStyles.title} numberOfLines={2}>
        {announcement.title}
      </Text>

      {/* Description */}
      {announcement.description !== undefined && (
        <Text style={defaultStyles.description} numberOfLines={2}>
          {announcement.description}
        </Text>
      )}

      {/* Meta row */}
      {(dateLabel !== undefined ||
        deadlineLabel !== undefined ||
        announcement.location !== undefined) && (
        <View style={defaultStyles.metaRow}>
          {dateLabel !== undefined && (
            <View style={defaultStyles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.warm.body} />
              <Text style={defaultStyles.metaText}>{dateLabel}</Text>
            </View>
          )}
          {timeLabel !== undefined && (
            <View style={defaultStyles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.warm.body} />
              <Text style={defaultStyles.metaText}>{timeLabel}</Text>
            </View>
          )}
          {deadlineLabel !== undefined && (
            <View style={defaultStyles.metaItem}>
              <Ionicons name="alarm-outline" size={12} color={colors.warm.body} />
              <Text style={defaultStyles.metaText}>Deadline: {deadlineLabel}</Text>
            </View>
          )}
          {announcement.location !== undefined && (
            <View style={defaultStyles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.warm.body} />
              <Text style={defaultStyles.metaText} numberOfLines={1}>
                {announcement.location}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Buttons row */}
      <View style={defaultStyles.buttonsRow}>
        {/* Primary CTA */}
        {announcement.participationEnabled && announcement.type !== 'limited_offer' ? (
          <View style={defaultStyles.ctaWrapper}>
            <ParticipationButton
              announcementId={announcement.id}
              announcementType={announcement.type}
              participantCount={announcement.participantCount}
              maxCapacity={announcement.maxCapacity}
              compact
            />
          </View>
        ) : (
          <TouchableOpacity
            style={defaultStyles.ctaButton}
            activeOpacity={0.8}
            onPress={() =>
              announcement.externalUrl !== undefined
                ? Linking.openURL(announcement.externalUrl)
                : router.push(`/announcements/${announcement.id}`)
            }
          >
            <Text style={defaultStyles.ctaButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}

        {/* Save outline button */}
        <TouchableOpacity style={defaultStyles.saveOutlineButton} activeOpacity={0.8}>
          <Text style={defaultStyles.saveOutlineText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Featured variant ───────────────────────────────────────────────────────────

function FeaturedCard({ announcement }: Readonly<{ announcement: Announcement }>) {
  const router = useRouter();
  const recordOpen = useRecommendationsStore((s) => s.recordOpen);
  const typeConfig = getTypeConfig(announcement.type);
  const ctaLabel = getCtaLabel(typeConfig, announcement.participationEnabled);

  const dateLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'MMM d, yyyy');

  const timeLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'HH:mm');

  const deadlineLabel =
    announcement.deadline === undefined
      ? undefined
      : format(new Date(announcement.deadline), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      style={featuredStyles.card}
      activeOpacity={0.88}
      onPress={() => {
        recordOpen(announcement.id);
        router.push(`/announcements/${announcement.id}`);
      }}
    >
      {/* Cover image at top */}
      {announcement.coverImageUrl === undefined ? (
        <View style={featuredStyles.coverPlaceholder} />
      ) : (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={featuredStyles.coverImage}
          contentFit="cover"
        />
      )}

      <View style={featuredStyles.body}>
        {/* Top content — grows to fill space above CTA */}
        <View style={featuredStyles.topContent}>
          {/* Badge + save row */}
          <View style={featuredStyles.badgeSaveRow}>
            <View style={[featuredStyles.badge, { backgroundColor: typeConfig.badgeBg }]}>
              <Text style={[featuredStyles.badgeText, { color: typeConfig.badgeText }]}>
                {typeConfig.label.toUpperCase()}
              </Text>
            </View>
            <SaveButton announcementId={announcement.id} announcementType={announcement.type} />
          </View>

          {/* Brand row */}
          <View style={featuredStyles.brandRow}>
            {announcement.professionalLogoUrl === undefined ? (
              <View style={featuredStyles.avatarFallback} />
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

          {/* Title — fixed 2-line height */}
          <Text style={featuredStyles.title} numberOfLines={2}>
            {announcement.title}
          </Text>

          {/* Description — fixed 2-line height */}
          <Text style={featuredStyles.description} numberOfLines={2}>
            {announcement.description ?? '\u00A0'}
          </Text>

          {/* Meta — always 2 rows for uniform height */}
          <View style={featuredStyles.metaColumn}>
            <View style={featuredStyles.metaItem}>
              {deadlineLabel === undefined ? (
                <>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={dateLabel === undefined ? 'transparent' : colors.warm.body}
                  />
                  <Text style={featuredStyles.metaText} numberOfLines={1}>
                    {dateLabel ?? '\u00A0'}
                  </Text>
                  {timeLabel !== undefined && (
                    <>
                      <Ionicons name="time-outline" size={12} color={colors.warm.body} />
                      <Text style={featuredStyles.metaText} numberOfLines={1}>
                        {timeLabel}
                      </Text>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Ionicons name="alarm-outline" size={12} color={colors.warm.body} />
                  <Text style={featuredStyles.metaText} numberOfLines={1}>
                    Deadline: {deadlineLabel}
                  </Text>
                </>
              )}
            </View>
            <View style={featuredStyles.metaItem}>
              <Ionicons
                name="location-outline"
                size={12}
                color={announcement.location === undefined ? 'transparent' : colors.warm.body}
              />
              <Text style={featuredStyles.metaText} numberOfLines={1}>
                {announcement.location ?? '\u00A0'}
              </Text>
            </View>
          </View>
        </View>

        {/* CTA — pinned to bottom */}
        {announcement.participationEnabled && announcement.type !== 'limited_offer' ? (
          <ParticipationButton
            announcementId={announcement.id}
            announcementType={announcement.type}
            participantCount={announcement.participantCount}
            maxCapacity={announcement.maxCapacity}
          />
        ) : (
          <TouchableOpacity
            style={featuredStyles.ctaButton}
            activeOpacity={0.8}
            onPress={() =>
              announcement.externalUrl === undefined
                ? router.push(`/announcements/${announcement.id}`)
                : Linking.openURL(announcement.externalUrl)
            }
          >
            <Text style={featuredStyles.ctaButtonText}>{ctaLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Compact variant ────────────────────────────────────────────────────────────

function CompactCard({ announcement }: Readonly<{ announcement: Announcement }>) {
  const router = useRouter();
  const recordOpen = useRecommendationsStore((s) => s.recordOpen);

  const dateLabel =
    announcement.eventStart === undefined
      ? undefined
      : format(new Date(announcement.eventStart), 'MMM d, yyyy');

  return (
    <TouchableOpacity
      style={compactStyles.card}
      activeOpacity={0.88}
      onPress={() => {
        recordOpen(announcement.id);
        router.push(`/announcements/${announcement.id}`);
      }}
    >
      {/* Left: image / placeholder */}
      {announcement.coverImageUrl === undefined ? (
        <View style={compactStyles.imagePlaceholder} />
      ) : (
        <Image
          source={{ uri: announcement.coverImageUrl }}
          style={compactStyles.image}
          contentFit="cover"
        />
      )}

      {/* Center: content */}
      <View style={compactStyles.content}>
        {announcement.professionalName.length > 0 && (
          <Text style={compactStyles.brandName} numberOfLines={1}>
            {announcement.professionalName}
          </Text>
        )}
        <Text style={compactStyles.title} numberOfLines={1}>
          {announcement.title}
        </Text>
        {dateLabel !== undefined && (
          <View style={compactStyles.dateRow}>
            <Ionicons name="calendar-outline" size={10} color={colors.warm.muted} />
            <Text style={compactStyles.dateText}>{dateLabel}</Text>
          </View>
        )}
      </View>

      {/* Right: bookmark */}
      <SaveButton
        announcementId={announcement.id}
        announcementType={announcement.type}
        iconType="bookmark"
      />
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

// ── Default styles ─────────────────────────────────────────────────────────────

const defaultStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    padding: spacing[4],
    gap: spacing[3],
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    flexShrink: 0,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warm.elevated,
    flexShrink: 0,
  },
  topLeftText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warm.title,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  title: {
    fontFamily: fontFamily.serifBold,
    fontSize: 16,
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
    gap: spacing[2],
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 12,
    color: colors.warm.body,
    fontFamily: fontFamily.sansMedium,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  ctaWrapper: {
    flex: 1,
  },
  ctaButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  saveOutlineButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2F0A0A',
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveOutlineText: {
    color: '#2F0A0A',
    fontSize: 13,
    fontWeight: '600',
  },
});

// ── Featured styles ────────────────────────────────────────────────────────────

const featuredStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    height: 530,
    borderWidth: 1,
    borderColor: colors.warm.border,
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: 176,
  },
  coverPlaceholder: {
    width: '100%',
    height: 176,
    backgroundColor: colors.warm.elevated,
  },
  body: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  topContent: {
    gap: spacing[3],
  },
  badgeSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 1,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    backgroundColor: colors.warm.elevated,
    flexShrink: 0,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.warm.muted,
    flexShrink: 1,
  },
  title: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 18,
    color: colors.warm.title,
    lineHeight: 25,
    minHeight: 50,
  },
  description: {
    fontSize: 13,
    color: colors.warm.muted,
    lineHeight: 19,
    minHeight: 38,
  },
  metaColumn: {
    gap: spacing[1],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 12,
    color: colors.warm.body,
    fontFamily: fontFamily.sansMedium,
  },
  ctaButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2F0A0A',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

// ── Compact styles ─────────────────────────────────────────────────────────────

const compactStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.warm.border,
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.warm.elevated,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
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
