import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Screen } from '@components/layout';
import { Text, Button, BackButton } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import {
  ANNOUNCEMENT_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_COLORS,
} from '@app-types/announcement';
import {
  useGetAnnouncement,
  useDeleteAnnouncement,
  useCurrentProfessionalId,
} from '@features/announcements/hooks/useAnnouncement';
import { ParticipationButton } from '@features/announcements/components/ParticipationButton';
import { SaveButton } from '@features/announcements/components/SaveButton';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isSameDay(s, e)) return format(s, 'MMMM d, yyyy');
  const sFormatted = format(s, s.getFullYear() === e.getFullYear() ? 'MMMM d' : 'MMMM d, yyyy');
  return `${sFormatted} – ${format(e, 'MMMM d, yyyy')}`;
}

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: announcement, isLoading, isError } = useGetAnnouncement(id);
  const { data: currentProfessionalId } = useCurrentProfessionalId();
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement();

  const isOwner =
    currentProfessionalId !== undefined &&
    currentProfessionalId !== null &&
    announcement !== undefined &&
    currentProfessionalId === announcement.professionalId;

  const handleDelete = () => {
    Alert.alert(
      'Delete Announcement',
      'This will permanently remove the announcement from the feed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAnnouncement(id, {
              onSuccess: () => {
                router.replace('/(tabs)/announcements');
              },
              onError: (err) => {
                Alert.alert('Could not delete', err.message);
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burgundy.mid} />
        </View>
      </Screen>
    );
  }

  if (isError || announcement === undefined) {
    return (
      <Screen>
        <BackButton />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load this announcement.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type];
  const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type] as IoniconName;

  let eventDateLabel: string | undefined;
  if (announcement.eventStart !== undefined) {
    eventDateLabel =
      announcement.eventEnd === undefined
        ? format(new Date(announcement.eventStart), 'MMMM d, yyyy')
        : formatDateRange(announcement.eventStart, announcement.eventEnd);
  }

  const daysUntilExpiry = differenceInDays(new Date(announcement.visibilityEnd), new Date());
  let expiryLabel = `Expires in ${daysUntilExpiry} days`;
  if (daysUntilExpiry <= 0) expiryLabel = 'Expired';
  else if (daysUntilExpiry === 1) expiryLabel = 'Expires tomorrow';

  return (
    <Screen noHorizontalPadding noTopInset>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Cover image + back button overlay */}
        <View style={styles.coverWrapper}>
          {announcement.coverImageUrl === undefined ? (
            <View style={[styles.coverImage, styles.coverPlaceholder]} />
          ) : (
            <Image
              source={{ uri: announcement.coverImageUrl }}
              style={styles.coverImage}
              contentFit="cover"
            />
          )}
          <View style={styles.backButtonOverlay}>
            <BackButton />
          </View>
          {/* Owner actions — top right */}
          {isOwner && (
            <View style={styles.ownerActionsOverlay}>
              <TouchableOpacity
                style={styles.ownerActionBtn}
                onPress={() => router.push(`/announcements/${id}/edit`)}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.warm.title} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ownerActionBtn, isDeleting && styles.ownerActionBtnDisabled]}
                onPress={handleDelete}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.error[500]} />
                ) : (
                  <Ionicons name="trash-outline" size={18} color={colors.error[500]} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Type badge + save button row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: typeColor.bg }]}>
              <Ionicons name={typeIcon} size={12} color={typeColor.text} />
              <Text style={[styles.badgeText, { color: typeColor.text }]}>
                {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
              </Text>
            </View>
            {announcement.audience === 'pro_only' && (
              <View style={styles.proBadge}>
                <Ionicons name="people-outline" size={12} color="#c4a8f0" />
                <Text style={styles.proBadgeText}>PROs only</Text>
              </View>
            )}
            <View style={styles.badgeSpacer} />
            <SaveButton announcementId={announcement.id} announcementType={announcement.type} />
          </View>

          {/* Professional — tappable, navigates to their profile */}
          {announcement.professionalName.length > 0 && (
            <TouchableOpacity
              style={styles.proRow}
              onPress={() => router.push(`/professional/${announcement.professionalId}`)}
              activeOpacity={0.7}
            >
              {announcement.professionalLogoUrl === undefined ? (
                <View style={[styles.proLogo, styles.proLogoFallback]}>
                  <Ionicons name="storefront-outline" size={12} color={colors.warm.muted} />
                </View>
              ) : (
                <Image
                  source={{ uri: announcement.professionalLogoUrl }}
                  style={styles.proLogo}
                  contentFit="cover"
                />
              )}
              <Text style={styles.proName}>{announcement.professionalName}</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.warm.muted} />
            </TouchableOpacity>
          )}

          {/* Title */}
          <Text style={styles.title}>{announcement.title}</Text>

          {/* Meta block */}
          <View style={styles.metaBlock}>
            {announcement.location !== undefined && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={18} color={colors.warm.muted} />
                <Text style={styles.metaText}>{announcement.location}</Text>
              </View>
            )}

            {eventDateLabel !== undefined && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.warm.muted} />
                <View>
                  <Text style={styles.metaText}>{eventDateLabel}</Text>
                  <Text style={styles.metaHint}>When this actually takes place</Text>
                </View>
              </View>
            )}
          </View>

          {/* Expiry notice — owner only */}
          {isOwner && (
            <Text style={styles.expiryNotice}>{expiryLabel}</Text>
          )}

          {/* Description */}
          {announcement.description !== undefined && (
            <View style={styles.descriptionBlock}>
              <Text style={styles.description}>{announcement.description}</Text>
            </View>
          )}

          {/* Participation section */}
          {announcement.participationEnabled && (
            <View style={styles.participationBlock}>
              <Text style={styles.participationTitle}>Participation</Text>
              <Text style={styles.participationHint}>
                Let the organizer know you're coming by confirming your participation below.
              </Text>
              <ParticipationButton
                announcementId={announcement.id}
                announcementType={announcement.type}
                participantCount={announcement.participantCount}
                maxCapacity={announcement.maxCapacity}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: {
    fontSize: 15,
    color: colors.warm.muted,
    textAlign: 'center',
  },
  coverWrapper: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 260,
  },
  coverPlaceholder: {
    backgroundColor: colors.warm.elevated,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: spacing[12],
    left: spacing[4],
  },
  ownerActionsOverlay: {
    position: 'absolute',
    top: spacing[12],
    right: spacing[4],
    flexDirection: 'row',
    gap: spacing[2],
  },
  ownerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 252, 249, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerActionBtnDisabled: {
    opacity: 0.5,
  },
  body: {
    padding: spacing[5],
    gap: spacing[4],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  badgeSpacer: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(150, 100, 240, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(150, 100, 240, 0.25)',
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c4a8f0',
    letterSpacing: 0.3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  proLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  proLogoFallback: {
    backgroundColor: colors.warm.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proName: {
    fontSize: 13,
    color: colors.warm.muted,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.warm.title,
    lineHeight: 32,
  },
  metaBlock: {
    gap: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.warm.border,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  metaText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.warm.body,
    lineHeight: 22,
  },
  metaHint: {
    fontSize: 12,
    color: colors.warm.muted,
    marginTop: 2,
  },
  descriptionBlock: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(40, 2, 10, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  description: {
    fontSize: 15,
    color: 'rgba(40, 2, 10, 0.80)',
    lineHeight: 24,
  },
  participationBlock: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(40, 2, 10, 0.12)',
    padding: spacing[5],
    gap: spacing[3],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  participationTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#2F0A0A',
  },
  participationHint: {
    fontSize: 13,
    color: 'rgba(40, 2, 10, 0.80)',
    lineHeight: 19,
  },
  expiryNotice: {
    fontSize: 12,
    color: colors.warm.muted,
    textAlign: 'center',
  },
});
