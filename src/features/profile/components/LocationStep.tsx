import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
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
    color: '#7b625b',
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
    borderColor: colors.burgundy.mid,
  },
  chipSelected: {
    backgroundColor: colors.burgundy.raised,
    borderColor: '#CEC1AE',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.burgundy.muted,
  },
  chipLabelSelected: {
    color: '#CEC1AE',
    fontWeight: '600',
  },
  error: {
    marginTop: spacing[1],
    color: colors.error[500],
  },
});
