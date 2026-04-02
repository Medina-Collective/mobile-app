import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { spacing } from '@theme/spacing';
import { BASED_IN_OPTIONS, SERVES_AREAS_OPTIONS } from '../schemas/professional-profile.schema';
import { SelectableList } from './SelectableList';

interface LocationStepProps {
  basedIn: string;
  onBasedInChange: (value: string) => void;
  basedInError?: string | undefined;
  servesAreas: string[];
  onServesAreasChange: (value: string[]) => void;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function LocationStep({
  basedIn,
  onBasedInChange,
  basedInError,
  servesAreas,
  onServesAreasChange,
}: Readonly<LocationStepProps>) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text variant="overline" style={styles.sectionLabel}>
          Where are you based?
        </Text>
        <SelectableList options={BASED_IN_OPTIONS} value={basedIn} onChange={onBasedInChange} />
        {basedInError !== undefined && basedInError.length > 0 && (
          <Text variant="caption" style={styles.error}>
            {basedInError}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="overline" style={styles.sectionLabel}>
          Where do you serve? (optional)
        </Text>
        <View style={styles.chips}>
          {SERVES_AREAS_OPTIONS.map((option) => {
            const isSelected = servesAreas.includes(option);
            return (
              <TouchableOpacity
                key={option}
                onPress={() => onServesAreasChange(toggleItem(servesAreas, option))}
                activeOpacity={0.8}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[8],
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    color: 'rgba(26, 18, 18, 0.45)',
    marginBottom: spacing[1],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.30)',
  },
  chipSelected: {
    backgroundColor: '#fff9f5',
    borderColor: '#2F0A0A',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(26, 18, 18, 0.55)',
  },
  chipLabelSelected: {
    color: '#1a1212',
    fontWeight: '600',
  },
  error: {
    marginTop: spacing[1],
    color: '#ef4444',
  },
});
