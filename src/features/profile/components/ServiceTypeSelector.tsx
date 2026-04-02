import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
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
    borderColor: 'rgba(160, 122, 95, 0.30)',
  },
  chipSelected: {
    backgroundColor: '#fff9f5',
    borderColor: '#2F0A0A',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(26, 18, 18, 0.55)',
  },
  chipLabelSelected: {
    color: '#1a1212',
    fontWeight: '600',
  },
});
