import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { MONETIZATION_TYPES, type MonetizationType } from '../schemas/professional-profile.schema';

interface MonetizationTypeSelectorProps {
  value: MonetizationType | undefined;
  onChange: (value: MonetizationType) => void;
  error?: string | undefined;
}

export function MonetizationTypeSelector({
  value,
  onChange,
  error,
}: Readonly<MonetizationTypeSelectorProps>) {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {MONETIZATION_TYPES.map(({ value: typeValue, label, description }) => {
          const isSelected = value === typeValue;
          return (
            <TouchableOpacity
              key={typeValue}
              onPress={() => onChange(typeValue)}
              activeOpacity={0.8}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <View style={styles.cardInner}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                    {label}
                  </Text>
                  <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                    {description}
                  </Text>
                </View>
              </View>
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
  list: {
    gap: spacing[3],
  },
  card: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.30)',
    borderRadius: 10,
  },
  cardSelected: {
    borderColor: '#2F0A0A',
    backgroundColor: '#fff9f5',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(160, 122, 95, 0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  radioSelected: {
    borderColor: '#2F0A0A',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F0A0A',
  },
  cardText: {
    flex: 1,
    gap: spacing[1],
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(26, 18, 18, 0.55)',
    letterSpacing: 0.1,
  },
  cardLabelSelected: {
    color: '#1a1212',
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(26, 18, 18, 0.45)',
    lineHeight: 16,
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
