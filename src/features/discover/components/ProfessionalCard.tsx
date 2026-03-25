import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';
import { PROFILE_TYPE_LABELS } from '@app-types/professional';
import type { Professional } from '@app-types/professional';

interface ProfessionalCardProps {
  professional: Professional;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfessionalCard({ professional }: Readonly<ProfessionalCardProps>) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/professional/${professional.id}` as RelativePathString)}
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitials}>{getInitials(professional.businessName) || '?'}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {professional.businessName}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {professional.category}
          {professional.subcategories.length > 0
            ? ` · ${professional.subcategories.slice(0, 2).join(', ')}`
            : ''}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={11} color={colors.burgundy.muted} />
          <Text style={styles.metaText}>{professional.basedIn}</Text>
          {professional.priceRange !== undefined && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{professional.priceRange}</Text>
            </>
          )}
        </View>
      </View>

      {/* Type badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{PROFILE_TYPE_LABELS[professional.profileType]}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.burgundy.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.burgundy.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.burgundy.raised,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#cdc1ad',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: spacing[0.5],
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#cdc1ad',
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.burgundy.muted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[0.5],
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.burgundy.muted,
  },
  metaDot: {
    fontSize: fontSize.xs,
    color: colors.burgundy.mid,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.burgundy.raised,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    color: '#cdc1ad',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
