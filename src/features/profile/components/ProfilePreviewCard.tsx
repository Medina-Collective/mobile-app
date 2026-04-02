import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { fontSize } from '@theme/typography';
import {
  PROFILE_TYPES,
  MONETIZATION_TYPES,
  SERVICE_TYPE_OPTIONS,
  type ProfessionalProfileFormData,
} from '../schemas/professional-profile.schema';

interface ProfilePreviewCardProps {
  data: ProfessionalProfileFormData;
  onEditStep: (step: number) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function SectionRow({
  label,
  onEdit,
  children,
}: Readonly<{
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}>) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionHeader}>
        <Text variant="overline" style={styles.sectionLabel}>
          {label}
        </Text>
        <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text variant="caption" style={styles.editLink}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

export function ProfilePreviewCard({ data, onEditStep }: Readonly<ProfilePreviewCardProps>) {
  const profileTypeLabel =
    PROFILE_TYPES.find((t) => t.value === data.profileType)?.label ?? data.profileType;

  const monetizationLabel =
    MONETIZATION_TYPES.find((t) => t.value === data.monetizationType)?.label ??
    data.monetizationType;

  const serviceTypeLabels = data.serviceTypes.map(
    (v) => SERVICE_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v,
  );

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.initials}>{getInitials(data.businessName) || '?'}</Text>
        </View>
        <View style={styles.headerText}>
          <Text variant="heading3" style={styles.businessName}>
            {data.businessName || '—'}
          </Text>
          <Text variant="bodySm" style={styles.profileTypeBadge}>
            {profileTypeLabel ?? '—'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Profile Identity */}
      <SectionRow label="Profile type" onEdit={() => onEditStep(0)}>
        <View style={styles.pills}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{profileTypeLabel}</Text>
          </View>
        </View>
      </SectionRow>

      {/* Monetization */}
      {data.monetizationType !== undefined && (
        <SectionRow label="How you operate" onEdit={() => onEditStep(1)}>
          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillMuted]}>
              <Text style={styles.pillText}>{monetizationLabel}</Text>
            </View>
          </View>
        </SectionRow>
      )}

      {/* Category */}
      <SectionRow label="Category" onEdit={() => onEditStep(2)}>
        {data.category.length > 0 ? (
          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillAccent]}>
              <Text style={[styles.pillText, styles.pillTextAccent]}>{data.category}</Text>
            </View>
            {data.subcategories.map((sub) => (
              <View key={sub} style={styles.pill}>
                <Text style={styles.pillText}>{sub}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text variant="caption" style={styles.emptyText}>
            No category selected
          </Text>
        )}
      </SectionRow>

      {/* Service Type */}
      {serviceTypeLabels.length > 0 && (
        <SectionRow label="Delivery" onEdit={() => onEditStep(4)}>
          <View style={styles.pills}>
            {serviceTypeLabels.map((label) => (
              <View key={label} style={styles.pill}>
                <Text style={styles.pillText}>{label}</Text>
              </View>
            ))}
          </View>
        </SectionRow>
      )}

      {/* Location */}
      <SectionRow label="Location" onEdit={() => onEditStep(5)}>
        {data.basedIn.length > 0 ? (
          <View style={styles.locationBlock}>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                Based in {data.basedIn}
              </Text>
            </View>
            {data.servesAreas.length > 0 && (
              <Text variant="caption" style={styles.contactText}>
                Serves: {data.servesAreas.join(', ')}
              </Text>
            )}
          </View>
        ) : (
          <Text variant="caption" style={styles.emptyText}>
            No location selected
          </Text>
        )}
      </SectionRow>

      {/* About & Contact */}
      <SectionRow label="About & Contact" onEdit={() => onEditStep(6)}>
        {data.description.length > 0 && (
          <Text variant="bodySm" style={styles.description}>
            {data.description}
          </Text>
        )}
        <View style={styles.contactList}>
          {data.priceRange !== undefined && (
            <View style={styles.contactRow}>
              <Ionicons name="pricetag-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                {data.priceRange}
                {data.startingPrice !== undefined && data.startingPrice.length > 0
                  ? ` · Starting at ${data.startingPrice}`
                  : ''}
              </Text>
            </View>
          )}
          {data.inquiryEmail.length > 0 && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                {data.inquiryEmail}
              </Text>
            </View>
          )}
          {data.instagram !== undefined && data.instagram.length > 0 && (
            <View style={styles.contactRow}>
              <Ionicons name="logo-instagram" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                @{data.instagram}
              </Text>
            </View>
          )}
          {data.phone !== undefined && data.phone.length > 0 && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                {data.phone}
              </Text>
            </View>
          )}
          {data.website !== undefined && data.website.length > 0 && (
            <View style={styles.contactRow}>
              <Ionicons name="link-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                {data.website}
              </Text>
            </View>
          )}
          {data.bookingLink !== undefined && data.bookingLink.length > 0 && (
            <View style={styles.contactRow}>
              <Ionicons name="calendar-outline" size={13} color="rgba(26, 18, 18, 0.45)" />
              <Text variant="caption" style={styles.contactText}>
                {data.bookingLink}
              </Text>
            </View>
          )}
        </View>
      </SectionRow>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff9f5',
    borderWidth: 2,
    borderColor: 'rgba(160, 122, 95, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#2F0A0A',
    letterSpacing: 1,
  },
  headerText: {
    flex: 1,
    gap: spacing[1],
  },
  businessName: {
    color: '#1a1212',
  },
  profileTypeBadge: {
    color: 'rgba(26, 18, 18, 0.45)',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e1dc',
    marginBottom: spacing[6],
  },
  sectionRow: {
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: 'rgba(26, 18, 18, 0.45)',
  },
  editLink: {
    color: '#2F0A0A',
    fontWeight: '600',
    letterSpacing: 0,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pill: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    backgroundColor: '#fff9f5',
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.30)',
  },
  pillAccent: {
    borderColor: '#2F0A0A',
  },
  pillMuted: {
    borderColor: 'transparent',
    backgroundColor: '#f3f0eb',
  },
  pillText: {
    fontSize: 12,
    color: '#1a1212',
    fontWeight: '500',
  },
  pillTextAccent: {
    fontWeight: '600',
  },
  locationBlock: {
    gap: spacing[2],
  },
  emptyText: {
    color: 'rgba(26, 18, 18, 0.35)',
    fontStyle: 'italic',
  },
  description: {
    color: 'rgba(26, 18, 18, 0.75)',
    lineHeight: 20,
  },
  contactList: {
    gap: spacing[2],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  contactText: {
    color: 'rgba(26, 18, 18, 0.55)',
  },
});
