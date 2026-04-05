import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { RelativePathString } from 'expo-router';
import { Screen } from '@components/layout';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize, fontFamily } from '@theme/typography';
import { useAuth } from '@features/auth';
import { useAuthStore } from '@store/auth.store';
import { useFollowsStore } from '@store/follows.store';
import { useSavedStore } from '@store/saved.store';
import { supabase } from '@services/supabase.client';
import { USER_ROLES } from '@constants/index';
import { useListAnnouncements } from '@features/announcements/hooks/useAnnouncement';
import { useAnnouncementsByProfessional } from '@features/announcements/hooks/useAnnouncement';
import { AnnouncementCard } from '@features/announcements/components/AnnouncementCard';
import { SectionHeader } from '@components/SectionHeader';
import { useRecentlyViewedStore } from '@store/recentlyViewed.store';
import type { Database } from '@app-types/supabase';
import type { Announcement } from '@app-types/announcement';
import { AccountSwitcher } from '@components/AccountSwitcher';
import type { AccountInfo } from '@components/AccountSwitcher';

type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];
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

function isActive(a: Announcement): boolean {
  return new Date(a.visibilityEnd) >= new Date();
}

async function openLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// ── Pro profile (own) ─────────────────────────────────────────────────────────

function ProOwnProfile({
  profile,
  accounts,
  activeAccountId,
  onSwitch,
  onAddAccount,
  onEdit,
  onSignOut,
}: Readonly<{
  profile: ProfessionalRow;
  accounts: AccountInfo[];
  activeAccountId: string;
  onSwitch: (id: string) => void;
  onAddAccount: () => void;
  onEdit: () => void;
  onSignOut: () => void;
}>) {
  const [activeTab, setActiveTab] = useState<Tab>('Active');
  const { data: announcements = [] } = useAnnouncementsByProfessional(profile.id);

  const { data: followerCount = 0 } = useQuery({
    queryKey: ['follower-count', profile.id],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', profile.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const activeAnnouncements = announcements.filter(isActive);
  const archivedAnnouncements = announcements.filter((a) => !isActive(a));
  const displayed: Announcement[] =
    activeTab === 'Active'
      ? activeAnnouncements
      : activeTab === 'Archived'
        ? archivedAnnouncements
        : announcements;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={proStyles.scroll}>
      {/* Top bar */}
      <View style={proStyles.topBar}>
        <AccountSwitcher
          accounts={accounts}
          activeAccountId={activeAccountId}
          onSwitch={onSwitch}
          onAddAccount={onAddAccount}
        />
        <TouchableOpacity style={proStyles.editBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color={colors.warm.body} />
          <Text style={proStyles.editBtnLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Brand card */}
      <View style={proStyles.card}>
        <View style={proStyles.cardTop}>
          {profile.logo_uri ? (
            <Image source={{ uri: profile.logo_uri }} style={proStyles.logoImage} />
          ) : (
            <View style={proStyles.logo}>
              <Text style={proStyles.logoText}>{getInitials(profile.business_name)}</Text>
            </View>
          )}
          <View style={proStyles.cardInfo}>
            <Text style={proStyles.businessName} numberOfLines={2}>
              {profile.business_name}
            </Text>
            <View style={proStyles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.warm.muted} />
              <Text style={proStyles.locationText}>{profile.based_in}</Text>
            </View>
          </View>
        </View>

        {profile.description ? (
          <Text style={proStyles.description}>{profile.description}</Text>
        ) : null}

        <View style={proStyles.divider} />

        {/* Stats */}
        <View style={proStyles.statsRow}>
          <View style={proStyles.statItem}>
            <Text style={proStyles.statValue}>{formatCount(followerCount)}</Text>
            <Text style={proStyles.statLabel}>Followers</Text>
          </View>
          <View style={proStyles.statItem}>
            <Text style={proStyles.statValue}>{announcements.length}</Text>
            <Text style={proStyles.statLabel}>Posts</Text>
          </View>
          <View style={proStyles.statItem}>
            <Text style={proStyles.statValue}>{activeAnnouncements.length}</Text>
            <Text style={proStyles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Action buttons */}
        {profile.website ? (
          <View style={proStyles.actionRow}>
            <TouchableOpacity
              style={proStyles.websiteBtn}
              onPress={() => void openLink(profile.website!)}
              activeOpacity={0.8}
            >
              <Ionicons name="open-outline" size={18} color={colors.burgundy.deep} />
              <Text style={proStyles.websiteBtnText}>Website</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={proStyles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[proStyles.tab, activeTab === tab && proStyles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[proStyles.tabLabel, activeTab === tab && proStyles.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Announcements */}
      <View style={proStyles.announcementList}>
        {displayed.length === 0 ? (
          <Text style={proStyles.emptyText}>No {activeTab.toLowerCase()} posts.</Text>
        ) : (
          displayed.map((a) => <AnnouncementCard key={a.id} announcement={a} variant="compact" />)
        )}
      </View>

      {/* Sign out */}
      <View style={proStyles.signOutWrap}>
        <TouchableOpacity style={proStyles.signOutBtn} onPress={onSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.error[500]} />
          <Text style={proStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Regular profile ────────────────────────────────────────────────────────────

// ── Root screen ────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const followedIds = useFollowsStore((s) => s.followedIds);
  const savedIds = useSavedStore((s) => s.savedIds);
  const recentlyViewedIds = useRecentlyViewedStore((s) => s.ids);
  const { data: allAnnouncements = [] } = useListAnnouncements();
  const activeView = useAuthStore((s) => s.activeView);
  const setActiveView = useAuthStore((s) => s.setActiveView);

  const isPro = user?.role === USER_ROLES.PROFESSIONAL;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => null);
    }, [refreshUser]),
  );

  // For pro users: load their full professional profile to render inline
  const { data: myProProfile, isLoading: proLoading } = useQuery({
    queryKey: ['my-professional-full', user?.id],
    enabled: !!user?.id && isPro,
    queryFn: async (): Promise<ProfessionalRow | null> => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: attendingCount = 0 } = useQuery({
    queryKey: ['attending-count', user?.id],
    enabled: !!user?.id && !isPro,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('announcement_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // ── Pro user view ────────────────────────────────────────────────────────────

  if (isPro && proLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.warm.muted} />
        </View>
      </Screen>
    );
  }

  // Build accounts array for pro users (used in both pro and personal views when isPro)
  const personalAccount: AccountInfo = {
    id: user?.id ?? 'personal',
    name: user?.displayName ?? 'Profile',
    type: 'personal',
    initials: getInitials(user?.displayName ?? '?'),
  };

  if (isPro && myProProfile && activeView === 'professional') {
    const proAccount: AccountInfo = {
      id: myProProfile.id,
      name: myProProfile.business_name,
      type: 'professional',
      initials: getInitials(myProProfile.business_name),
      ...(myProProfile.logo_uri != null ? { avatarUrl: myProProfile.logo_uri } : {}),
    };
    const proAccounts: AccountInfo[] = [proAccount, personalAccount];

    return (
      <Screen>
        <ProOwnProfile
          profile={myProProfile}
          accounts={proAccounts}
          activeAccountId={myProProfile.id}
          onSwitch={(id) => setActiveView(id === myProProfile.id ? 'professional' : 'personal')}
          onAddAccount={() => router.push('/(auth)/sign-in' as RelativePathString)}
          onEdit={() => router.push(`/professional/${myProProfile.id}/edit` as RelativePathString)}
          onSignOut={() => void signOut()}
        />
      </Screen>
    );
  }

  // ── Regular user view (also used when a pro switches to personal view) ────────

  // For pro users in personal view, show both accounts in the switcher
  const switcherAccounts: AccountInfo[] =
    isPro && myProProfile
      ? [
          {
            id: myProProfile.id,
            name: myProProfile.business_name,
            type: 'professional' as const,
            initials: getInitials(myProProfile.business_name),
            ...(myProProfile.logo_uri != null ? { avatarUrl: myProProfile.logo_uri } : {}),
          },
          personalAccount,
        ]
      : [personalAccount];

  const recentlyViewed = allAnnouncements
    .filter((a) => recentlyViewedIds.includes(a.id))
    .sort((a, b) => recentlyViewedIds.indexOf(a.id) - recentlyViewedIds.indexOf(b.id))
    .slice(0, 5);

  const menuItems = [
    {
      icon: 'heart-outline' as const,
      label: 'Saved Items',
      count: savedIds.length,
      onPress: () => router.push('/(tabs)/favorites' as RelativePathString),
    },
    {
      icon: 'calendar-outline' as const,
      label: 'Attending Events',
      count: attendingCount,
      onPress: () => {},
    },
    {
      icon: 'people-outline' as const,
      label: 'Following',
      count: followedIds.length,
      onPress: () => {},
    },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <AccountSwitcher
            accounts={switcherAccounts}
            activeAccountId={personalAccount.id}
            onSwitch={(id) => {
              if (isPro && myProProfile && id === myProProfile.id) {
                setActiveView('professional');
              }
            }}
            onAddAccount={() => router.push('/(auth)/sign-in' as RelativePathString)}
          />
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={20} color={colors.burgundy.deep} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.cardTop}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color="#EDE4D8" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.displayName}>{user?.displayName ?? '—'}</Text>
              <Text style={styles.email}>{user?.email ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followedIds.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{savedIds.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendingCount}</Text>
              <Text style={styles.statLabel}>Attending</Text>
            </View>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => router.push('/admin' as RelativePathString)}
            activeOpacity={0.8}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="shield-outline" size={22} color={colors.burgundy.deep} />
            </View>
            <Text style={styles.menuLabel}>Admin Panel</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.burgundy.deep} />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={22} color={colors.burgundy.deep} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.count > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.burgundy.deep} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recently Viewed" />
            <View style={styles.announcementList}>
              {recentlyViewed.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} variant="compact" />
              ))}
            </View>
          </View>
        )}

        <View style={styles.signOutWrap}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => void signOut()}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error[500]} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

// ── Pro profile styles ─────────────────────────────────────────────────────────

const proStyles = StyleSheet.create({
  scroll: { paddingBottom: spacing[12] },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
  },
  editBtnLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
    color: colors.warm.muted,
  },

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

  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
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
  tabLabelActive: {
    color: '#ffffff',
  },

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

  signOutWrap: { marginTop: spacing[8], alignItems: 'center' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  signOutText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    color: colors.error[500],
  },
});

// ── Regular profile styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing[12] },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 10, 10, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    padding: spacing[5],
    marginTop: spacing[5],
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.burgundy.deep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  displayName: {
    fontFamily: fontFamily.serifBold,
    fontSize: fontSize.xl,
    color: colors.warm.title,
  },
  email: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    color: colors.warm.muted,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.warm.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 18,
    fontFamily: fontFamily.sansBold,
    color: colors.warm.title,
  },
  statLabel: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: colors.warm.border },

  adminBanner: {
    marginTop: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 14,
    backgroundColor: colors.warm.surface,
    borderWidth: 1,
    borderColor: colors.warm.border,
  },
  adminBadge: {
    backgroundColor: colors.burgundy.deep,
    borderRadius: 999,
    paddingHorizontal: spacing[3],
    paddingVertical: 3,
  },
  adminBadgeText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 1,
  },

  section: { marginTop: spacing[6] },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 14,
  },
  menuIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.base,
    color: colors.warm.body,
  },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  countBadge: {
    backgroundColor: colors.warm.chip,
    borderRadius: 20,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  countText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
  },

  announcementList: { gap: spacing[3] },
  signOutWrap: { marginTop: spacing[8], alignItems: 'center' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  signOutText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    color: colors.error[500],
  },
});
