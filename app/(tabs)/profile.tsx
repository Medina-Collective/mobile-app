import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { RelativePathString } from 'expo-router';
import { Screen } from '@components/layout';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { supabase } from '@services/supabase.client';
import { USER_ROLES } from '@constants/index';
import type { Database } from '@app-types/supabase';

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
        <Ionicons name="add-circle-outline" size={20} color="#cdc1ad" />
        <Text style={styles.menuLabel}>Create professional profile</Text>
        <Ionicons name="chevron-forward" size={16} color="#7b625b" />
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
          <Text style={styles.menuLabel}>View my profile</Text>
          <Ionicons name="chevron-forward" size={16} color="#7b625b" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.menuRow} onPress={() => onEdit(profile.id)}>
        <Ionicons name="create-outline" size={18} color="#cdc1ad" />
        <Text style={styles.menuLabel}>Edit my profile</Text>
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

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

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="heading2">Profile</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Text variant="heading3" style={styles.avatarInitial}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text variant="heading4">{user?.displayName ?? '—'}</Text>
        <Text variant="body" style={styles.email}>
          {user?.email ?? '—'}
        </Text>
        <View style={styles.roleBadge}>
          <Text variant="caption" style={styles.roleText}>
            {user?.role ?? 'user'}
          </Text>
        </View>
      </View>

      {/* Admin panel shortcut */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/admin' as RelativePathString)}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#e0a83a" />
          <Text style={styles.menuLabel}>Admin Panel</Text>
          <Ionicons name="chevron-forward" size={16} color="#7b625b" />
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

      <View style={styles.footer}>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => void signOut()}
          style={styles.signOutButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing[4], paddingBottom: spacing[4] },
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
    gap: spacing[2],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.burgundy.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  avatarInitial: { color: colors.beige[200] },
  email: { color: colors.neutral[500] },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.burgundy.raised,
    borderRadius: 20,
  },
  roleText: { color: colors.beige[300], textTransform: 'capitalize' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.burgundy.raised,
  },
  menuLabel: { flex: 1, fontSize: 14, color: '#cdc1ad' },
  proSection: { marginTop: spacing[2] },
  proCard: {
    backgroundColor: colors.burgundy.surface,
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[3],
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
  footer: { marginTop: 'auto', paddingBottom: spacing[4] },
  signOutButton: { width: '100%' },
});
