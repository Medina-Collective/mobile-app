import { useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { differenceInDays } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';
import { PROFILE_TYPE_LABELS, SERVICE_TYPE_LABELS } from '@app-types/professional';
import { useGetProfessional } from '@features/discover/hooks/useProfessional';
import { FollowButton } from '@features/follows/components/FollowButton';
import { useAnnouncementsByProfessional } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import type { Announcement } from '@app-types/announcement';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

async function openLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ContactRow({
  icon,
  label,
  onPress,
}: Readonly<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}>) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.contactRow}>
      <View style={styles.contactIconWrap}>
        <Ionicons name={icon} size={16} color="#CEC1AE" />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.burgundy.muted} />
    </TouchableOpacity>
  );
}

function InfoChip({ label }: Readonly<{ label: string }>) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: professional, isLoading, isError, refetch } = useGetProfessional(id);
  const { data: announcements = [] } = useAnnouncementsByProfessional(id);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#CEC1AE" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#CEC1AE" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || professional === undefined) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#CEC1AE" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.burgundy.muted} />
          <Text variant="bodySm" style={styles.errorText}>
            Could not load this profile.
          </Text>
          <Button
            title="Try again"
            variant="outline"
            onPress={handleRetry}
            style={styles.retryBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const profileTypeLabel = PROFILE_TYPE_LABELS[professional.profileType];
  const serviceTypeLabels = professional.serviceTypes.map((v) => SERVICE_TYPE_LABELS[v]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#CEC1AE" />
        </TouchableOpacity>
        <TouchableOpacity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push(`/professional/${id}/edit` as any)}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="create-outline" size={20} color="#CEC1AE" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {getInitials(professional.businessName) || '?'}
            </Text>
          </View>
          <Text variant="heading2" style={styles.businessName}>
            {professional.businessName}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profileTypeLabel}</Text>
            </View>
            {professional.priceRange !== undefined && (
              <View style={[styles.badge, styles.badgePrice]}>
                <Text style={styles.badgeText}>
                  {professional.priceRange}
                  {professional.startingPrice === undefined
                    ? ''
                    : ` · from ${professional.startingPrice}`}
                </Text>
              </View>
            )}
          </View>

          <FollowButton professionalId={id} variant="pill" />
        </View>

        <View style={styles.divider} />

        {/* Category & subcategories */}
        <View style={styles.section}>
          <Text variant="overline" style={styles.sectionLabel}>
            Speciality
          </Text>
          <View style={styles.chipRow}>
            <View style={[styles.chip, styles.chipAccent]}>
              <Text style={[styles.chipText, styles.chipTextAccent]}>{professional.category}</Text>
            </View>
            {professional.subcategories.map((sub) => (
              <InfoChip key={sub} label={sub} />
            ))}
          </View>
        </View>

        {/* Service types */}
        {serviceTypeLabels.length > 0 && (
          <View style={styles.section}>
            <Text variant="overline" style={styles.sectionLabel}>
              How they work
            </Text>
            <View style={styles.chipRow}>
              {serviceTypeLabels.map((label) => (
                <InfoChip key={label} label={label} />
              ))}
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text variant="overline" style={styles.sectionLabel}>
            Location
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.burgundy.muted} />
            <Text variant="bodySm" style={styles.locationText}>
              Based in {professional.basedIn}
            </Text>
          </View>
          {professional.servesAreas.length > 0 && (
            <Text variant="caption" style={styles.servesText}>
              Serves: {professional.servesAreas.join(', ')}
            </Text>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text variant="overline" style={styles.sectionLabel}>
            About
          </Text>
          <Text variant="bodySm" style={styles.description}>
            {professional.description}
          </Text>
        </View>

        {/* Announcements */}
        {announcements.length > 0 && (
          <View style={styles.section}>
            <Text variant="overline" style={styles.sectionLabel}>
              Announcements
            </Text>
            <View style={styles.announcementList}>
              {announcements.map((a: Announcement) => {
                const endDate = new Date(a.visibilityEnd);
                const endLocalDay = new Date(
                  endDate.getFullYear(),
                  endDate.getMonth(),
                  endDate.getDate(),
                );
                const today = new Date();
                const todayLocalDay = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );
                const isExpired = differenceInDays(endLocalDay, todayLocalDay) < 0;
                return (
                  <View key={a.id} style={styles.announcementWrapper}>
                    <AnnouncementCard announcement={a} variant="compact" />
                    {isExpired && (
                      <View style={styles.expiredOverlay} pointerEvents="none">
                        <View style={styles.expiredBadge}>
                          <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text variant="overline" style={styles.sectionLabel}>
            Contact
          </Text>
          <View style={styles.contactList}>
            <ContactRow
              icon="mail-outline"
              label={professional.inquiryEmail}
              onPress={() => void openLink(`mailto:${professional.inquiryEmail}`)}
            />
            {professional.instagram !== undefined && (
              <ContactRow
                icon="logo-instagram"
                label={`@${professional.instagram}`}
                onPress={() => void openLink(`https://instagram.com/${professional.instagram}`)}
              />
            )}
            {professional.phone !== undefined && (
              <ContactRow
                icon="call-outline"
                label={professional.phone}
                onPress={() => void openLink(`tel:${professional.phone}`)}
              />
            )}
            {professional.bookingLink !== undefined &&
              (() => {
                const link = professional.bookingLink;
                return (
                  <ContactRow
                    icon="calendar-outline"
                    label="Book an appointment"
                    onPress={() => void openLink(link)}
                  />
                );
              })()}
            {professional.website !== undefined &&
              (() => {
                const site = professional.website;
                return (
                  <ContactRow
                    icon="link-outline"
                    label={site}
                    onPress={() => void openLink(site)}
                  />
                );
              })()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.burgundy.deep,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.burgundy.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading / error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: {
    color: colors.burgundy.muted,
    textAlign: 'center',
  },
  retryBtn: {
    minWidth: 140,
  },

  // Scroll
  scroll: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[12],
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 2,
    borderColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  avatarInitials: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#CEC1AE',
    letterSpacing: 1,
  },
  businessName: {
    color: '#CEC1AE',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
  },
  badge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
  },
  badgePrice: {
    borderColor: '#CEC1AE',
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: '#CEC1AE',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.burgundy.surface,
    marginBottom: spacing[6],
  },

  // Sections
  section: {
    marginBottom: spacing[8],
    gap: spacing[3],
  },
  sectionLabel: {
    color: '#7b625b',
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
  },
  chipAccent: {
    borderColor: '#CEC1AE',
  },
  chipText: {
    fontSize: fontSize.xs,
    color: '#CEC1AE',
    fontWeight: '500',
  },
  chipTextAccent: {
    fontWeight: '700',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  locationText: {
    color: '#CEC1AE',
  },
  servesText: {
    color: colors.burgundy.muted,
    marginTop: spacing[1],
  },

  // Description
  description: {
    color: colors.beige[300],
    lineHeight: 22,
  },

  // Announcements
  announcementList: {
    gap: spacing[3],
  },
  announcementWrapper: {
    position: 'relative',
  },
  expiredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiredBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  expiredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#ffffff',
  },

  // Contact
  contactList: {
    gap: spacing[1],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.burgundy.surface,
    borderRadius: 10,
  },
  contactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.burgundy.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#CEC1AE',
    fontWeight: '500',
  },
});
