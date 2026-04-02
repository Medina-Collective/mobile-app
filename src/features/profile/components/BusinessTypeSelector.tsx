import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { PROFILE_TYPES, type ProfileType } from '../schemas/professional-profile.schema';

interface BusinessTypeSelectorProps {
  value: ProfileType | undefined;
  onChange: (value: ProfileType) => void;
  error?: string | undefined;
}

export function BusinessTypeSelector({
  value,
  onChange,
  error,
}: Readonly<BusinessTypeSelectorProps>) {
  return (
    <View style={styles.container}>
      <Text variant="overline" style={styles.label}>
        Which best describes you?
      </Text>
      <View style={styles.grid}>
        {PROFILE_TYPES.map(({ value: typeValue, label, description }) => {
          const isSelected = value === typeValue;
          return (
            <TouchableOpacity
              key={typeValue}
              onPress={() => onChange(typeValue)}
              activeOpacity={0.8}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {label}
              </Text>
              <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                {description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error !== undefined && error.length > 0 && (
        <Text variant="caption" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[8],
  },
  label: {
    marginBottom: spacing[3],
    color: 'rgba(26, 18, 18, 0.45)',
  },
  grid: {
    gap: spacing[2],
  },
  card: {
    width: '100%',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.30)',
    borderRadius: 8,
    gap: spacing[1],
  },
  cardSelected: {
    borderColor: '#2F0A0A',
    backgroundColor: '#fff9f5',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(26, 18, 18, 0.55)',
    letterSpacing: 0.2,
  },
  cardLabelSelected: {
    color: '#1a1212',
  },
  cardDesc: {
    fontSize: 11,
    color: 'rgba(26, 18, 18, 0.45)',
    lineHeight: 15,
    opacity: 0.7,
  },
  cardDescSelected: {
    color: 'rgba(26, 18, 18, 0.55)',
    opacity: 1,
  },
  error: {
    marginTop: spacing[2],
    color: colors.error[500],
  },
});
