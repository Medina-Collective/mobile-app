import { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize, fontFamily } from '@theme/typography';
import { useGetProfessional } from '@features/discover/hooks/useProfessional';
import { FollowButton } from '@features/follows/components/FollowButton';
import {
  useAnnouncementsByProfessional,
  useCurrentProfessionalId,
} from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import { supabase } from '@services/supabase.client';
import type { Announcement } from '@app-types/announcement';

type Tab = 'Active' | 'Archived' | 'All';
const TABS: Tab[] = ['Active', 'Archived', 'All'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

async function openLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
}

function isActive(a: Announcement): boolean {
  return new Date(a.visibilityEnd) >= new Date();
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={16} color={colors.warm.body} />
      </View>
      <Text style={styles.contactLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.warm.muted} />
    </TouchableOpacity>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Active');

  const { data: professional, isLoading, isError, refetch } = useGetProfessional(id);
  const { data: announcements = [] } = useAnnouncementsByProfessional(id);
  const { data: myProfessionalId } = useCurrentProfessionalId();
  const isOwnProfile = myProfessionalId === id;

  const { data: followerCount = 0 } = useQuery({
    queryKey: ['follower-count', id],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: id.length > 0,
  });

  const handleBack = useCallback(() => router.back(), [router]);
  const handleRetry = useCallback(async () => refetch(), [refetch]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.warm.body} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.warm.muted} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (isError || professional === undefined) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.warm.body} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.warm.muted} />
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

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeAnnouncements = announcements.filter(isActive);
  const archivedAnnouncements = announcements.filter((a) => !isActive(a));
  const displayed: Announcement[] =
    activeTab === 'Active'
      ? activeAnnouncements
      : activeTab === 'Archived'
        ? archivedAnnouncements
        : announcements;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.warm.body} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Profile</Text>
        <TouchableOpacity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push(`/professional/${id}/edit` as any)}
          style={styles.backBtn}
        >
          <Ionicons name="create-outline" size={20} color={colors.warm.body} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            {professional.logoUri ? (
              <Image source={{ uri: professional.logoUri }} style={styles.logoImage} />
            ) : (
              <View style={styles.logo}>
                <Text style={styles.logoText}>{getInitials(professional.businessName)}</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.businessName} numberOfLines={2}>
                {professional.businessName}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={colors.warm.muted} />
                <Text style={styles.locationText}>{professional.basedIn}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{professional.description}</Text>

          <View style={styles.divider} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCount(followerCount)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{announcements.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeAnnouncements.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {!isOwnProfile && (
              <View style={styles.followWrap}>
                <FollowButton professionalId={id} variant="pill" />
              </View>
            )}
            {professional.website !== undefined && (
              <TouchableOpacity
                style={styles.websiteBtn}
                onPress={() => void openLink(professional.website!)}
                activeOpacity={0.8}
              >
                <Ionicons name="open-outline" size={18} color={colors.burgundy.deep} />
                <Text style={styles.websiteBtnText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category chips */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, styles.chipAccent]}>
            <Text style={[styles.chipText, styles.chipTextAccent]}>{professional.category}</Text>
          </View>
          {professional.subcategories.map((sub) => (
            <View key={sub} style={styles.chip}>
              <Text style={styles.chipText}>{sub}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements */}
        <View style={styles.announcementList}>
          {displayed.length === 0 ? (
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} posts.</Text>
          ) : (
            displayed.map((a) => <AnnouncementCard key={a.id} announcement={a} variant="compact" />)
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTACT</Text>
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
                    onPress={() => void openLink(link!)}
                  />
                );
              })()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.warm.bg,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
    backgroundColor: colors.warm.bg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warm.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.sm,
    color: colors.warm.title,
  },

  // Loading / error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  errorText: { color: colors.warm.muted, textAlign: 'center' },
  retryBtn: { minWidth: 140 },

  // Scroll
  scroll: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[12],
    paddingTop: spacing[4],
  },

  // Brand card
  card: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    padding: spacing[5],
    gap: spacing[4],
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
    flexShrink: 0,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.burgundy.deep,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.serifBold,
    color: '#EDE4D8',
    letterSpacing: 2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cardInfo: { flex: 1, gap: 0, paddingTop: spacing[1] },
  businessName: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.serifBold,
    color: colors.warm.title,
    lineHeight: 28,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 0,
  },
  locationText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.base,
    color: colors.warm.muted,
  },
  description: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: colors.warm.border,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansBold,
    color: colors.warm.title,
  },
  statLabel: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    marginTop: 2,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  followWrap: { flex: 1 },
  websiteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    height: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.burgundy.deep,
  },
  websiteBtnText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    color: colors.burgundy.deep,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  chip: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    backgroundColor: colors.warm.chip,
    borderWidth: 1,
    borderColor: colors.warm.border,
  },
  chipAccent: {
    backgroundColor: 'rgba(29, 8, 8, 0.07)',
    borderColor: 'rgba(29, 8, 8, 0.15)',
  },
  chipText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
  },
  chipTextAccent: { fontFamily: fontFamily.sansBold, color: colors.warm.title },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[5],
  },
  tab: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.chip,
  },
  tabActive: {
    backgroundColor: colors.burgundy.deep,
    borderColor: colors.burgundy.deep,
  },
  tabLabel: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
  },
  tabLabelActive: { color: '#ffffff' },

  // Announcements
  announcementList: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  emptyText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },

  // Section / contact
  section: { marginTop: spacing[8], gap: spacing[3] },
  sectionLabel: {
    fontFamily: fontFamily.sansBold,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
    color: colors.warm.muted,
  },
  contactList: { gap: spacing[1] },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.warm.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warm.border,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.warm.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    flex: 1,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
  },
});
