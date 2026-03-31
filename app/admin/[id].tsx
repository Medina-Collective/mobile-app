import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { supabase } from '@services/supabase.client';
import type { Database } from '@app-types/supabase';

type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];

const STATUS_COLOR: Record<string, string> = {
  pending_review: '#e0a83a',
  approved: '#4caf7d',
  rejected: '#e57373',
  draft: '#7b625b',
  changes_requested: '#e0a83a',
};

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  changes_requested: 'Changes Requested',
};

const PROFILE_TYPE_LABELS: Record<string, string> = {
  shop: 'Shop',
  service: 'Service',
  organizer: 'Organizer',
  classes_circles: 'Classes & Circles',
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  at_home: 'At home',
  has_studio: 'Has a studio',
  online: 'Online',
  travels_to_client: 'Travels to client',
};

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function AdminProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: pro, isLoading } = useQuery({
    queryKey: ['admin', 'professional', id],
    queryFn: async (): Promise<ProfessionalRow> => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: 'approved' | 'rejected') => {
      const { error } = await supabase.from('professionals').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'professionals'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'professional', id] });
      void queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });

  const handleApprove = () => {
    Alert.alert('Approve profile', `Approve "${pro?.business_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => updateStatus.mutate('approved') },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject profile', `Reject "${pro?.business_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus.mutate('rejected') },
    ]);
  };

  if (isLoading || !pro) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color="#CEC1AE" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const isPending = pro.status === 'pending_review';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#CEC1AE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Review Profile
        </Text>
        <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[pro.status] + '22' }]}>
          <Text style={[styles.statusPillText, { color: STATUS_COLOR[pro.status] }]}>
            {STATUS_LABEL[pro.status]}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Business hero */}
        <View style={styles.hero}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{pro.business_name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.heroName}>{pro.business_name}</Text>
          <Text style={styles.heroType}>
            {PROFILE_TYPE_LABELS[pro.profile_type] ?? pro.profile_type} · {pro.category}
          </Text>
        </View>

        {/* Basics */}
        <Section title="Business Info">
          <InfoRow
            label="Profile type"
            value={PROFILE_TYPE_LABELS[pro.profile_type] ?? pro.profile_type}
          />
          <InfoRow label="Category" value={pro.category} />
          {pro.subcategories.length > 0 && (
            <InfoRow label="Subcategories" value={pro.subcategories.join(', ')} />
          )}
          {pro.service_types.length > 0 && (
            <InfoRow
              label="Service types"
              value={pro.service_types.map((s) => SERVICE_TYPE_LABELS[s] ?? s).join(', ')}
            />
          )}
          <InfoRow label="Based in" value={pro.based_in} />
          {pro.serves_areas.length > 0 && (
            <InfoRow label="Serves areas" value={pro.serves_areas.join(', ')} />
          )}
        </Section>

        {/* About */}
        <Section title="About">
          <Text style={styles.description}>{pro.description}</Text>
        </Section>

        {/* Contact */}
        <Section title="Contact">
          <InfoRow label="Email" value={pro.inquiry_email} />
          {pro.instagram && <InfoRow label="Instagram" value={`@${pro.instagram}`} />}
          {pro.phone && <InfoRow label="Phone" value={pro.phone} />}
          {pro.website && <InfoRow label="Website" value={pro.website} />}
          {pro.booking_link && <InfoRow label="Booking" value={pro.booking_link} />}
        </Section>

        {/* Pricing */}
        {(pro.price_range ?? pro.starting_price) && (
          <Section title="Pricing">
            {pro.price_range && <InfoRow label="Price range" value={pro.price_range} />}
            {pro.starting_price && <InfoRow label="Starting price" value={pro.starting_price} />}
          </Section>
        )}

        {/* Meta */}
        <Section title="Submission">
          <InfoRow
            label="Submitted"
            value={new Date(pro.created_at).toLocaleDateString('en-CA', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          <InfoRow label="User ID" value={pro.user_id} />
        </Section>

        {/* Spacer for action buttons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky action bar — only for pending */}
      {isPending && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={handleReject}
            disabled={updateStatus.isPending}
          >
            <Ionicons name="close" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={handleApprove}
            disabled={updateStatus.isPending}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a0208' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#2d0610',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2d0610',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#CEC1AE' },
  statusPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  scroll: { paddingBottom: spacing[6] },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#2d0610',
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4a0e18',
    borderWidth: 2,
    borderColor: '#6b1e2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  heroAvatarText: { fontSize: 28, fontWeight: '700', color: '#CEC1AE' },
  heroName: { fontSize: 20, fontWeight: '700', color: '#CEC1AE' },
  heroType: { fontSize: 13, color: '#9b8070' },
  section: {
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7b625b',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing[3],
  },
  sectionBody: {
    backgroundColor: '#2d0610',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d0a12',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#3d0a12',
    gap: spacing[4],
  },
  infoLabel: { fontSize: 13, color: '#7b625b', flexShrink: 0 },
  infoValue: { fontSize: 13, color: '#CEC1AE', textAlign: 'right', flex: 1 },
  description: {
    fontSize: 14,
    color: '#CEC1AE',
    lineHeight: 22,
    padding: spacing[4],
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    paddingBottom: spacing[8],
    backgroundColor: '#1a0208',
    borderTopWidth: 1,
    borderTopColor: '#2d0610',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: 14,
  },
  approveBtn: { backgroundColor: '#2d7a54' },
  rejectBtn: { backgroundColor: '#7a2d2d' },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
