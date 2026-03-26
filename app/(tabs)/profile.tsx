import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { RelativePathString } from 'expo-router';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { useAuthStore } from '@store/auth.store';
import { useFollowsStore } from '@store/follows.store';
import { supabase } from '@services/supabase.client';
import { USER_ROLES } from '@constants/index';
import { useListProfessionals } from '@features/discover/hooks/useProfessional';
import type { Database } from '@app-types/supabase';
import type { Professional } from '@app-types/professional';

type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  rejected: 'Rejected',
};

const STATUS_COLOR: Record<string, string> = {
  draft: '#7b625b',
  pending_review: '#e0a83a',
  approved: '#4caf7d',
  changes_requested: '#e0a83a',
  rejected: '#e57373',
};

interface ProProfileSectionProps {
  isLoading: boolean;
  profile: ProfessionalRow | null;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
}

function ProProfileSection({
  isLoading,
  profile,
  onView,
  onEdit,
  onCreate,
}: Readonly<ProProfileSectionProps>) {
  if (isLoading) return <ActivityIndicator color="#cdc1ad" />;

  if (profile === null) {
    return (
      <TouchableOpacity style={styles.menuRow} onPress={onCreate}>
        <Ionicons name="add-circle-outline" size={20} color={colors.burgundy.mid} />
        <Text style={styles.menuLabel}>Create professional profile</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.warm.muted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.proCard}>
      <View style={styles.proCardHeader}>
        <Text style={styles.proName}>{profile.business_name}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[profile.status] + '22' }]}
        >
          <Text style={[styles.statusText, { color: STATUS_COLOR[profile.status] }]}>
            {STATUS_LABEL[profile.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.proMeta}>
        {profile.profile_type} · {profile.category}
      </Text>

      {profile.status === 'approved' && (
        <TouchableOpacity style={styles.menuRow} onPress={() => onView(profile.id)}>
          <Ionicons name="eye-outline" size={18} color="#cdc1ad" />
          <Text style={styles.proMenuLabel}>View my profile</Text>
          <Ionicons name="chevron-forward" size={16} color="#7b625b" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.menuRow} onPress={() => onEdit(profile.id)}>
        <Ionicons name="create-outline" size={18} color="#cdc1ad" />
        <Text style={styles.proMenuLabel}>Edit my profile</Text>
        <Ionicons name="chevron-forward" size={16} color="#7b625b" />
      </TouchableOpacity>
      {profile.status === 'pending_review' && (
        <Text style={styles.pendingNote}>
          Your profile is under review. You'll be notified once approved.
        </Text>
      )}
      {profile.status === 'rejected' && (
        <Text style={styles.rejectedNote}>
          Your profile was not approved. Edit it and resubmit.
        </Text>
      )}
    </View>
  );
}

function FollowedProRow({ professional }: Readonly<{ professional: Professional }>) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.followedRow}
      onPress={() => router.push(`/professional/${professional.id}` as RelativePathString)}
      activeOpacity={0.8}
    >
      <View style={styles.followedAvatar}>
        <Text style={styles.followedInitial}>
          {professional.businessName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.followedInfo}>
        <Text style={styles.followedName} numberOfLines={1}>{professional.businessName}</Text>
        <Text style={styles.followedMeta} numberOfLines={1}>{professional.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.warm.muted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const followedIds = useFollowsStore((s) => s.followedIds);
  const { data: allProfessionals } = useListProfessionals();

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => null);
    }, [refreshUser]),
  );

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const { data: myProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-professional', user?.id],
    enabled: !!user?.id && !isAdmin,
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

  const followedPros = (allProfessionals ?? []).filter((p) => followedIds.includes(p.id));

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName ?? '—'}</Text>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role ?? 'user'}</Text>
          </View>
        </View>

        {/* Admin panel shortcut */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/admin' as RelativePathString)}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.burgundy.mid} />
            <Text style={styles.menuLabel}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.warm.muted} />
          </TouchableOpacity>
        )}

        {/* Professional profile status */}
        {!isAdmin && (
          <View style={styles.proSection}>
            <ProProfileSection
              isLoading={profileLoading}
              profile={myProfile ?? null}
              onView={(id) => router.push(`/professional/${id}` as RelativePathString)}
              onEdit={(id) => router.push(`/professional/${id}/edit` as RelativePathString)}
              onCreate={() => router.push('/(auth)/professional-profile' as RelativePathString)}
            />
          </View>
        )}

        {/* Following */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Following</Text>
          {followedPros.length === 0 ? (
            <Text style={styles.emptyText}>You're not following anyone yet.</Text>
          ) : (
            <View style={styles.followedList}>
              {followedPros.map((p) => (
                <FollowedProRow key={p.id} professional={p} />
              ))}
            </View>
          )}
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => void signOut()}
          style={styles.signOutButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing[4], paddingBottom: spacing[2] },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.warm.title,
    letterSpacing: 0.2,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
    gap: spacing[2],
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(68, 0, 7, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(68, 0, 7, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.burgundy.mid,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.warm.title,
  },
  email: { fontSize: 13, color: colors.warm.muted },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: 'rgba(68, 0, 7, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(68, 0, 7, 0.15)',
  },
  roleText: { fontSize: 11, fontWeight: '600', color: colors.burgundy.mid, textTransform: 'capitalize' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.divider,
  },
  menuLabel: { flex: 1, fontSize: 14, color: colors.warm.body },
  proMenuLabel: { flex: 1, fontSize: 14, color: '#cdc1ad' },
  proSection: { marginTop: spacing[2] },
  proCard: {
    backgroundColor: colors.burgundy.surface,
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[3],
    shadowColor: colors.burgundy.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  proName: { fontSize: 15, fontWeight: '700', color: '#cdc1ad', flex: 1 },
  proMeta: { fontSize: 12, color: '#7b625b' },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  pendingNote: { fontSize: 12, color: '#e0a83a', marginTop: spacing[1] },
  rejectedNote: { fontSize: 12, color: '#e57373', marginTop: spacing[1] },
  scroll: { paddingBottom: spacing[12] },
  signOutButton: { width: '100%', marginTop: spacing[4] },
  section: { marginTop: spacing[6] },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.warm.muted,
    marginBottom: spacing[3],
  },
  emptyText: { fontSize: 13, color: colors.warm.muted },
  followedList: { gap: spacing[2] },
  followedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.warm.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.warm.border,
  },
  followedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(68, 0, 7, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(68, 0, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followedInitial: { fontSize: 15, fontWeight: '700', color: colors.burgundy.mid },
  followedInfo: { flex: 1, gap: 2 },
  followedName: { fontSize: 14, fontWeight: '600', color: colors.warm.title },
  followedMeta: { fontSize: 11, color: colors.warm.muted },
});
