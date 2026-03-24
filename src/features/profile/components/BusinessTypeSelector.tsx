import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { PROFILE_TYPES, type ProfileType } from '../schemas/professional-profile.schema';

interface BusinessTypeSelectorProps {
  value: ProfileType | undefined;
  onChange: (value: ProfileType) => void;
  error?: string;
}

export function BusinessTypeSelector({
  value,
  onChange,
  error,
}: Readonly<BusinessTypeSelectorProps>) {
  return (
    <View style={styles.container}>
      <Text variant="overline" style={styles.label}>
        Profile type
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
    color: '#7b625b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  card: {
    width: '48%',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
    borderRadius: 8,
    gap: spacing[1],
  },
  cardSelected: {
    borderColor: '#cdc1ad',
    backgroundColor: colors.burgundy.raised,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.burgundy.muted,
    letterSpacing: 0.2,
  },
  cardLabelSelected: {
    color: '#cdc1ad',
  },
  cardDesc: {
    fontSize: 11,
    color: colors.burgundy.muted,
    lineHeight: 15,
    opacity: 0.7,
  },
  cardDescSelected: {
    color: '#cdc1ad',
    opacity: 0.8,
  },
  error: {
    marginTop: spacing[2],
    color: colors.error[500],
  },
});
