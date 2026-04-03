import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_ICONS } from '@app-types/announcement';
import {
  useGetAnnouncement,
  useDeleteAnnouncement,
  useCurrentProfessionalId,
  useAnnouncementsByProfessional,
  fromDbType,
} from '@features/announcements/hooks/useAnnouncement';
import { ParticipationButton } from '@features/announcements/components/ParticipationButton';
import { FollowButton } from '@features/follows/components/FollowButton';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TYPE_CTA: Record<'event' | 'offer' | 'update', string> = {
  event: 'Participate',
  offer: 'View Offer',
  update: 'Learn More',
};

// page background — used to make the gradient fade into it
const PAGE_BG = '#faf6f0';
// card bg for info cells — "beige-light"
const CELL_BG = '#f0ece6';
// icon circle bg — "beige"
const ICON_BG = '#e5e0d8';

// ── InfoCard ──────────────────────────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={infoCardStyles.cell}>
      <View style={infoCardStyles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.warm.title} />
      </View>
      <Text style={infoCardStyles.label}>{label}</Text>
      <Text style={infoCardStyles.value}>{value}</Text>
    </View>
  );
}

const infoCardStyles = StyleSheet.create({
  cell: {
    flex: 1,
    backgroundColor: CELL_BG,
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    color: colors.warm.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  value: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12,
    color: colors.warm.title,
    textAlign: 'center',
    lineHeight: 16,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: announcement, isLoading, isError } = useGetAnnouncement(id);
  const { data: currentProfessionalId } = useCurrentProfessionalId();
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement();
  const { data: related = [] } = useAnnouncementsByProfessional(announcement?.professionalId ?? '');

  const isSaved = useSavedStore((s) => s.isSaved(id));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const recordSignal = useRecommendationsStore((s) => s.recordSignal);

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
              onSuccess: () => router.replace('/(tabs)'),
              onError: (err) => Alert.alert('Could not delete', err.message),
            });
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (announcement === undefined) return;
    await Share.share({ message: announcement.title, title: announcement.title });
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load this announcement.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const typeIcon = ANNOUNCEMENT_TYPE_ICONS[announcement.type] as IoniconName;
  const formType = fromDbType(announcement.type);
  const ctaLabel = TYPE_CTA[formType];

  let eventDateLabel: string | undefined;
  let eventTimeLabel: string | undefined;
  if (announcement.eventStart !== undefined) {
    const d = new Date(announcement.eventStart);
    eventDateLabel = format(d, 'MMM d, yyyy');
    eventTimeLabel = format(d, 'h:mm a');
  }

  let deadlineDateLabel: string | undefined;
  if (announcement.deadline !== undefined) {
    deadlineDateLabel = format(new Date(announcement.deadline), 'MMM d, yyyy');
  }

  const relatedAnnouncements = related.filter((a) => a.id !== id).slice(0, 4);
  const isOffer = announcement.type === 'limited_offer';

  return (
    <Screen noHorizontalPadding noTopInset style={styles.screen}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} bounces>
          {/* ── Hero ── */}
          <View style={styles.heroWrapper}>
            {announcement.coverImageUrl !== undefined ? (
              <Image
                source={{ uri: announcement.coverImageUrl }}
                style={styles.heroImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.heroImage, styles.heroPlaceholder]} />
            )}

            {/*
              Gradient: transparent at top → PAGE_BG at bottom.
              Matches web: bg-gradient-to-t from-background via-background/20 to-transparent
            */}
            <LinearGradient
              colors={[
                'rgba(250,246,240,0)',
                'rgba(250,246,240,0.45)',
                'rgba(250,246,240,0.85)',
                'rgba(250,246,240,1)',
              ]}
              locations={[0.58, 0.66, 0.72, 0.76]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Category pill — floating in the gradient zone */}
            <View style={styles.heroPillRow}>
              <View style={styles.pill}>
                <Ionicons name={typeIcon} size={11} color="#fff" />
                <Text style={styles.pillText}>{ANNOUNCEMENT_TYPE_LABELS[announcement.type]}</Text>
              </View>
              {announcement.audience === 'pro_only' && (
                <View style={[styles.pill, styles.pillPro]}>
                  <Text style={styles.pillText}>PROs only</Text>
                </View>
              )}
            </View>

            {/* Top nav — buttons with frosted card bg like the web */}
            <View style={styles.heroNav}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color={colors.warm.title} />
              </TouchableOpacity>

              <View style={styles.navRight}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => {
                    if (!isSaved) recordSignal(announcement.type, 'save');
                    toggleSaved(id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSaved ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isSaved ? colors.burgundy.mid : colors.warm.title}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtn} onPress={handleShare} activeOpacity={0.8}>
                  <Ionicons name="share-social-outline" size={20} color={colors.warm.title} />
                </TouchableOpacity>

                {isOwner && (
                  <>
                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={() => router.push(`/announcements/${id}/edit`)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pencil-outline" size={18} color={colors.warm.title} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.navBtn, isDeleting && styles.navBtnDisabled]}
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
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ── Content — overlaps hero by 48px, same as web -mt-12 ── */}
          <View style={styles.content}>
            {/* Brand row */}
            {announcement.professionalName.length > 0 && (
              <View style={styles.brandRow}>
                <TouchableOpacity
                  style={styles.brandLeft}
                  onPress={() => router.push(`/professional/${announcement.professionalId}`)}
                  activeOpacity={0.7}
                >
                  {announcement.professionalLogoUrl !== undefined ? (
                    <Image
                      source={{ uri: announcement.professionalLogoUrl }}
                      style={styles.brandLogo}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.brandLogo, styles.brandLogoFallback]}>
                      <Ionicons name="storefront-outline" size={14} color={colors.warm.muted} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.brandName}>{announcement.professionalName}</Text>
                    <Text style={styles.brandSub}>Organizer</Text>
                  </View>
                </TouchableOpacity>
                <FollowButton professionalId={announcement.professionalId} variant="pill" />
              </View>
            )}

            {/* Title + description */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{announcement.title}</Text>
              {announcement.description !== undefined && (
                <Text style={styles.description}>{announcement.description}</Text>
              )}
            </View>

            {/* Info cards — 3-column grid */}
            {(eventDateLabel !== undefined ||
              eventTimeLabel !== undefined ||
              announcement.location !== undefined ||
              deadlineDateLabel !== undefined) && (
              <View style={styles.infoGrid}>
                {eventDateLabel !== undefined && (
                  <InfoCard icon="calendar-outline" label="Date" value={eventDateLabel} />
                )}
                {eventTimeLabel !== undefined && (
                  <InfoCard icon="time-outline" label="Time" value={eventTimeLabel} />
                )}
                {deadlineDateLabel !== undefined && (
                  <InfoCard icon="alarm-outline" label="Deadline" value={deadlineDateLabel} />
                )}
                {announcement.location !== undefined && (
                  <InfoCard
                    icon="location-outline"
                    label="Location"
                    value={announcement.location}
                  />
                )}
              </View>
            )}

            {/* Offer details */}
            {isOffer && announcement.externalUrl !== undefined && (
              <View style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerTitle}>Special Offer</Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(announcement.externalUrl!)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.offerLink}>View Details</Text>
                  </TouchableOpacity>
                </View>
                {deadlineDateLabel !== undefined && (
                  <Text style={styles.offerValid}>Valid until {deadlineDateLabel}</Text>
                )}
              </View>
            )}

            {/* You might also like */}
            {relatedAnnouncements.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.relatedTitle}>You might also like</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedList}
                >
                  {relatedAnnouncements.map((item) => (
                    <View key={item.id} style={styles.relatedCard}>
                      <AnnouncementCard announcement={item} variant="featured" />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ── Sticky bottom CTA ── */}
        <View style={styles.stickyBar}>
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => {
              if (!isSaved) recordSignal(announcement.type, 'save');
              toggleSaved(id);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? colors.burgundy.mid : colors.warm.muted}
            />
          </TouchableOpacity>

          {announcement.participationEnabled ? (
            <View style={styles.ctaFlex}>
              <ParticipationButton
                announcementId={announcement.id}
                announcementType={announcement.type}
                participantCount={announcement.participantCount}
                maxCapacity={announcement.maxCapacity}
              />
            </View>
          ) : (
            <Button title={ctaLabel} variant="solid" style={styles.ctaFlex} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: PAGE_BG },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[4] },
  errorText: { fontSize: 15, color: colors.warm.muted, textAlign: 'center' },

  // ── Hero ──
  heroWrapper: { position: 'relative' },
  heroImage: { width: '100%', height: Dimensions.get('window').height * 0.68 },
  heroPlaceholder: { backgroundColor: colors.warm.elevated },

  heroNav: {
    position: 'absolute',
    top: spacing[12],
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,252,249,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    // backdrop-blur equivalent — slightly opaque white card bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navBtnDisabled: { opacity: 0.5 },

  // ── Content — overlaps hero ──
  content: {
    marginTop: -100,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
    backgroundColor: PAGE_BG,
  },

  heroPillRow: {
    position: 'absolute',
    bottom: '23%',
    left: spacing[5],
    flexDirection: 'row',
    gap: spacing[2],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    alignSelf: 'flex-start',
    backgroundColor: colors.burgundy.deep,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  pillPro: { backgroundColor: 'rgba(150,100,240,0.85)' },
  pillText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Brand
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  brandLogo: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.warm.border,
  },
  brandLogoFallback: {
    backgroundColor: colors.warm.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 17,
    color: colors.warm.title,
    lineHeight: 22,
  },
  brandSub: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    color: colors.warm.muted,
    lineHeight: 18,
  },

  // Title + description — web uses font-display (Playfair) for h1
  titleBlock: { gap: spacing[2] },
  title: {
    fontFamily: fontFamily.serifBold,
    fontSize: 24,
    color: colors.warm.title,
    lineHeight: 30,
  },
  description: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 15,
    color: colors.warm.muted,
    lineHeight: 24,
  },

  // Info grid
  infoGrid: { flexDirection: 'row', gap: spacing[2] },

  // Offer card
  offerCard: {
    backgroundColor: CELL_BG,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[1],
  },
  offerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  offerTitle: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    color: colors.warm.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  offerLink: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, color: colors.burgundy.mid },
  offerValid: { fontFamily: fontFamily.sansRegular, fontSize: 12, color: colors.warm.muted },

  // Related — web uses font-display (Playfair) for h2
  relatedSection: { gap: spacing[3] },
  relatedTitle: { fontFamily: fontFamily.serifSemiBold, fontSize: 18, color: colors.warm.title },
  relatedList: { gap: spacing[3] },
  relatedCard: { width: 280 },

  // Sticky bar
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.warm.border,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: 'rgba(250,246,240,0.92)',
  },
  bookmarkBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  ctaFlex: { flex: 1 },
});
