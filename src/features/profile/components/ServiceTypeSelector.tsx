import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { SERVICE_TYPE_OPTIONS } from '../schemas/professional-profile.schema';

interface ServiceTypeSelectorProps {
  value: string[];
  onChange: (serviceTypes: string[]) => void;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function ServiceTypeSelector({ value, onChange }: Readonly<ServiceTypeSelectorProps>) {
  return (
    <View style={styles.grid}>
      {SERVICE_TYPE_OPTIONS.map(({ value: optValue, label }) => {
        const isSelected = value.includes(optValue);
        return (
          <TouchableOpacity
            key={optValue}
            onPress={() => onChange(toggleItem(value, optValue))}
            activeOpacity={0.8}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.burgundy.mid,
  },
  chipSelected: {
    backgroundColor: colors.burgundy.raised,
    borderColor: '#CEC1AE',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.burgundy.muted,
  },
  chipLabelSelected: {
    color: '#CEC1AE',
    fontWeight: '600',
  },
});
