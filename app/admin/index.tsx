import { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { RelativePathString } from 'expo-router';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { supabase } from '@services/supabase.client';
import type { Database } from '@app-types/supabase';

type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];
type StatusFilter = 'pending_review' | 'approved' | 'rejected';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'pending_review', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLOR: Record<StatusFilter, string> = {
  pending_review: '#e0a83a',
  approved: '#4caf7d',
  rejected: '#e57373',
};

const PROFILE_TYPE_LABELS: Record<string, string> = {
  shop: 'Shop',
  service: 'Service',
  organizer: 'Organizer',
  classes_circles: 'Classes & Circles',
};

export default function AdminPanelScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>('pending_review');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'professionals', filter],
    queryFn: async (): Promise<ProfessionalRow[]> => {
      const { data: rows, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', filter)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return rows;
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#cdc1ad" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Profile requests</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterTab,
                active && { borderBottomColor: STATUS_COLOR[key], borderBottomWidth: 2 },
              ]}
            >
              <Text style={[styles.filterLabel, active && { color: STATUS_COLOR[key] }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#cdc1ad" size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#3d0a12" />
              <Text style={styles.emptyText}>No {filter.replace('_', ' ')} profiles</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/admin/${item.id}` as RelativePathString)}
            >
              {/* Avatar + info */}
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.business_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.bizName} numberOfLines={1}>
                    {item.business_name}
                  </Text>
                  <Text style={styles.bizMeta}>
                    {PROFILE_TYPE_LABELS[item.profile_type] ?? item.profile_type} · {item.category}
                  </Text>
                  <Text style={styles.bizLocation}>
                    <Ionicons name="location-outline" size={11} color="#7b625b" /> {item.based_in}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_COLOR[item.status as StatusFilter] },
                    ]}
                  />
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#7b625b"
                    style={{ marginTop: spacing[2] }}
                  />
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  Submitted{' '}
                  {new Date(item.created_at).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.cardCta}>Tap to review →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a0208' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
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
  },
  title: { fontSize: 18, fontWeight: '700', color: '#cdc1ad' },
  subtitle: { fontSize: 12, color: '#7b625b', marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#1a0208',
    borderBottomWidth: 1,
    borderBottomColor: '#2d0610',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#7b625b' },
  list: { padding: spacing[4], gap: spacing[3] },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[20],
  },
  emptyText: { fontSize: 14, color: '#7b625b' },
  card: {
    backgroundColor: '#2d0610',
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#3d0a12',
    gap: spacing[3],
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a0e18',
    borderWidth: 1,
    borderColor: '#6b1e2a',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#cdc1ad' },
  cardInfo: { flex: 1, gap: 3 },
  bizName: { fontSize: 15, fontWeight: '700', color: '#cdc1ad' },
  bizMeta: { fontSize: 12, color: '#9b8070' },
  bizLocation: { fontSize: 12, color: '#7b625b' },
  cardRight: { alignItems: 'flex-end', gap: spacing[1] },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#3d0a12',
  },
  cardDate: { fontSize: 11, color: '#7b625b' },
  cardCta: { fontSize: 11, color: '#9b8070', fontWeight: '600' },
});
